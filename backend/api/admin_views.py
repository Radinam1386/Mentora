from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .auth_utils import require_admin
from .model_providers import provider_statuses
from .observability import LOG_RETENTION_DAYS, prune_observability_logs
from .models import (
    AdminAuditLog,
    ApiUsageLog,
    AppEventLog,
    SupportMessage,
    SupportTicket,
    SubscriptionPlan,
    User,
    UserSubscription,
)
from .support_views import VALID_STATUSES, serialize_support_ticket


def current_local_date():
    return timezone.localdate()


def to_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def request_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def active_subscription_for_user(user):
    today = current_local_date()
    return (
        user.subscriptions
        .filter(is_active=True, end_date__gte=today)
        .order_by("-end_date", "-created_at")
        .first()
    )


def subscription_remaining_days(subscription):
    if not subscription or not subscription.is_active:
        return 0
    today = current_local_date()
    if subscription.end_date < today:
        return 0
    return (subscription.end_date - today).days + 1


def serialize_admin_user(user):
    subscription = active_subscription_for_user(user)
    return {
        "id": user.id,
        "name": user.name or "",
        "phone": user.phone or "",
        "email": user.email or "",
        "grade": user.grade or "",
        "major": user.major or "",
        "targetRank": user.target_rank or "",
        "studyHours": user.daily_study_hours,
        "onboardingCompleted": user.onboarding_completed,
        "isPhoneVerified": user.is_phone_verified,
        "isAdmin": user.is_admin,
        "createdAt": user.created_at.isoformat(),
        "subscription": serialize_admin_subscription(subscription) if subscription else None,
    }


def serialize_admin_subscription(subscription):
    if not subscription:
        return None
    remaining = subscription_remaining_days(subscription)
    return {
        "id": subscription.id,
        "planId": subscription.plan_id,
        "planName": subscription.plan_name,
        "price": subscription.price,
        "totalDays": subscription.total_days,
        "remainingDays": remaining,
        "active": subscription.is_active and remaining > 0,
        "startDate": subscription.start_date.isoformat(),
        "endDate": subscription.end_date.isoformat(),
        "createdAt": subscription.created_at.isoformat(),
    }


def serialize_plan(plan):
    return {
        "id": plan.id,
        "name": plan.name,
        "slug": plan.slug,
        "durationDays": plan.duration_days,
        "price": plan.price,
        "highlight": plan.highlight,
        "isActive": plan.is_active,
    }


def serialize_api_usage(log):
    return {
        "id": log.id,
        "provider": log.provider,
        "sdk": log.sdk,
        "model": log.model,
        "operation": log.operation,
        "keyFingerprint": log.key_fingerprint,
        "status": log.status,
        "latencyMs": log.latency_ms,
        "retryCount": log.retry_count,
        "promptTokens": log.prompt_tokens,
        "completionTokens": log.completion_tokens,
        "totalTokens": log.total_tokens,
        "responseId": log.response_id,
        "finishReason": log.finish_reason,
        "errorType": log.error_type,
        "errorMessage": log.error_message,
        "httpStatus": log.http_status,
        "metadata": log.metadata,
        "createdAt": log.created_at.isoformat(),
        "user": {
            "id": log.user.id,
            "name": log.user.name or "",
            "phone": log.user.phone or "",
        } if log.user else None,
    }


def serialize_app_event(event):
    return {
        "id": event.id,
        "level": event.level,
        "source": event.source,
        "eventType": event.event_type,
        "message": event.message,
        "metadata": event.metadata,
        "createdAt": event.created_at.isoformat(),
        "user": {
            "id": event.user.id,
            "name": event.user.name or "",
            "phone": event.user.phone or "",
        } if event.user else None,
    }


def serialize_audit_log(log):
    return {
        "id": log.id,
        "action": log.action,
        "targetType": log.target_type,
        "targetId": log.target_id,
        "note": log.note,
        "metadata": log.metadata,
        "ipAddress": log.ip_address,
        "createdAt": log.created_at.isoformat(),
        "admin": {
            "id": log.admin_user.id,
            "name": log.admin_user.name or "",
            "phone": log.admin_user.phone or "",
        } if log.admin_user else None,
    }


def audit_admin_action(request, action, target_type="", target_id="", note="", metadata=None):
    return AdminAuditLog.objects.create(
        admin_user=request.mentora_user,
        action=action,
        target_type=target_type,
        target_id=str(target_id or ""),
        note=note or "",
        metadata=metadata or {},
        ip_address=request_ip(request),
    )


def require_note(data):
    note = str(data.get("note") or data.get("internalNote") or "").strip()
    if not note:
        return None, Response({"error": "ثبت یادداشت داخلی برای این عملیات الزامی است."}, status=400)
    return note, None


def get_target_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


def get_plan(data):
    plan_id = data.get("planId") or data.get("id")
    slug = data.get("slug")
    try:
        if slug:
            return SubscriptionPlan.objects.get(slug=slug, is_active=True)
        return SubscriptionPlan.objects.get(id=plan_id, is_active=True)
    except (SubscriptionPlan.DoesNotExist, ValueError, TypeError):
        return None


@api_view(["GET"])
@require_admin
def admin_me(request):
    return Response({"admin": serialize_admin_user(request.mentora_user)})


@api_view(["GET"])
@require_admin
def admin_dashboard(request):
    prune_observability_logs()
    today = current_local_date()
    now = timezone.now()
    since_24h = now - timedelta(days=1)
    since_7d = now - timedelta(days=7)

    api_total = ApiUsageLog.objects.filter(created_at__gte=since_24h).count()
    api_errors = ApiUsageLog.objects.filter(created_at__gte=since_24h, status=ApiUsageLog.STATUS_ERROR).count()
    error_rate = round((api_errors / api_total) * 100, 1) if api_total else 0

    return Response({
        "summary": {
            "totalUsers": User.objects.count(),
            "newUsers7d": User.objects.filter(created_at__gte=since_7d).count(),
            "activeSubscriptions": UserSubscription.objects.filter(is_active=True, end_date__gte=today).count(),
            "expiringSubscriptions7d": UserSubscription.objects.filter(
                is_active=True,
                end_date__gte=today,
                end_date__lte=today + timedelta(days=7),
            ).count(),
            "openTickets": SupportTicket.objects.exclude(
                status__in=[SupportTicket.STATUS_RESOLVED, SupportTicket.STATUS_CLOSED],
            ).count(),
            "apiCalls24h": api_total,
            "apiErrors24h": api_errors,
            "apiErrorRate24h": error_rate,
            "logRetentionDays": LOG_RETENTION_DAYS,
        },
        "recentTickets": [
            serialize_support_ticket(ticket, admin=True)
            for ticket in SupportTicket.objects.select_related("user", "assigned_admin")[:8]
        ],
        "recentApiErrors": [
            serialize_api_usage(log)
            for log in ApiUsageLog.objects.select_related("user").filter(status=ApiUsageLog.STATUS_ERROR)[:8]
        ],
        "recentEvents": [
            serialize_app_event(event)
            for event in AppEventLog.objects.select_related("user").filter(level__in=["error", "critical"])[:8]
        ],
    })


@api_view(["GET"])
@require_admin
def admin_users(request):
    query = str(request.GET.get("q") or "").strip()
    subscription = str(request.GET.get("subscription") or "").strip()
    limit = min(max(to_int(request.GET.get("limit"), 50), 1), 100)
    users = User.objects.all().order_by("-created_at")

    if query:
        users = users.filter(
            Q(name__icontains=query)
            | Q(phone__icontains=query)
            | Q(email__icontains=query)
            | Q(major__icontains=query)
            | Q(grade__icontains=query)
        )

    if subscription == "active":
        users = users.filter(subscriptions__is_active=True, subscriptions__end_date__gte=current_local_date()).distinct()
    elif subscription == "expired":
        users = users.exclude(subscriptions__is_active=True, subscriptions__end_date__gte=current_local_date())
    elif subscription == "admin":
        users = users.filter(is_admin=True)

    return Response({
        "users": [serialize_admin_user(user) for user in users[:limit]],
        "total": users.count(),
    })


@api_view(["GET"])
@require_admin
def admin_user_detail(request, user_id):
    user = get_target_user(user_id)
    if not user:
        return Response({"error": "کاربر پیدا نشد."}, status=404)

    return Response({
        "user": serialize_admin_user(user),
        "subscriptions": [
            serialize_admin_subscription(subscription)
            for subscription in user.subscriptions.order_by("-created_at")
        ],
        "plans": [serialize_plan(plan) for plan in SubscriptionPlan.objects.filter(is_active=True).order_by("duration_days")],
        "stats": {
            "tasks": user.tasks.count(),
            "completedTasks": user.tasks.filter(is_completed=True).count(),
            "weeklyPlans": user.weekly_plans.count(),
            "chatMessages": user.chat_messages.count(),
            "supportTickets": user.support_tickets.count(),
        },
        "tickets": [
            serialize_support_ticket(ticket, admin=True)
            for ticket in user.support_tickets.select_related("assigned_admin")[:10]
        ],
    })


@api_view(["POST"])
@require_admin
def admin_subscription_activate(request, user_id):
    user = get_target_user(user_id)
    if not user:
        return Response({"error": "کاربر پیدا نشد."}, status=404)
    note, error = require_note(request.data)
    if error:
        return error
    plan = get_plan(request.data)
    if not plan:
        return Response({"error": "پلن انتخاب‌شده پیدا نشد."}, status=404)

    today = current_local_date()
    user.subscriptions.filter(is_active=True).update(is_active=False)
    subscription = UserSubscription.objects.create(
        user=user,
        plan=plan,
        plan_name=plan.name,
        price=plan.price,
        total_days=plan.duration_days,
        start_date=today,
        end_date=today + timedelta(days=max(plan.duration_days, 1) - 1),
        is_active=True,
    )
    audit_admin_action(
        request,
        "subscription.activate",
        "UserSubscription",
        subscription.id,
        note,
        {"userId": user.id, "planId": plan.id},
    )
    return Response({"subscription": serialize_admin_subscription(subscription), "user": serialize_admin_user(user)})


@api_view(["POST"])
@require_admin
def admin_subscription_extend(request, user_id):
    user = get_target_user(user_id)
    if not user:
        return Response({"error": "کاربر پیدا نشد."}, status=404)
    note, error = require_note(request.data)
    if error:
        return error
    raw_days = to_int(request.data.get("days"), 0)
    if raw_days < 1:
        return Response({"error": "تعداد روزهای تمدید معتبر نیست."}, status=400)
    days = min(730, raw_days)

    today = current_local_date()
    subscription = active_subscription_for_user(user)
    if subscription:
        subscription.end_date = subscription.end_date + timedelta(days=days)
        subscription.total_days = subscription.total_days + days
        subscription.save(update_fields=["end_date", "total_days"])
    else:
        subscription = UserSubscription.objects.create(
            user=user,
            plan=None,
            plan_name="تمدید دستی ادمین",
            price=0,
            total_days=days,
            start_date=today,
            end_date=today + timedelta(days=days - 1),
            is_active=True,
        )

    audit_admin_action(
        request,
        "subscription.extend",
        "UserSubscription",
        subscription.id,
        note,
        {"userId": user.id, "days": days},
    )
    return Response({"subscription": serialize_admin_subscription(subscription), "user": serialize_admin_user(user)})


@api_view(["POST"])
@require_admin
def admin_subscription_change_plan(request, user_id):
    user = get_target_user(user_id)
    if not user:
        return Response({"error": "کاربر پیدا نشد."}, status=404)
    note, error = require_note(request.data)
    if error:
        return error
    plan = get_plan(request.data)
    if not plan:
        return Response({"error": "پلن انتخاب‌شده پیدا نشد."}, status=404)

    today = current_local_date()
    current_subscription = active_subscription_for_user(user)
    remaining_days = subscription_remaining_days(current_subscription)
    total_days = plan.duration_days + remaining_days
    user.subscriptions.filter(is_active=True).update(is_active=False)
    subscription = UserSubscription.objects.create(
        user=user,
        plan=plan,
        plan_name=plan.name,
        price=plan.price,
        total_days=total_days,
        start_date=today,
        end_date=today + timedelta(days=max(total_days, 1) - 1),
        is_active=True,
    )
    audit_admin_action(
        request,
        "subscription.change_plan",
        "UserSubscription",
        subscription.id,
        note,
        {"userId": user.id, "planId": plan.id, "preservedDays": remaining_days},
    )
    return Response({"subscription": serialize_admin_subscription(subscription), "user": serialize_admin_user(user)})


@api_view(["POST"])
@require_admin
def admin_subscription_cancel(request, user_id):
    user = get_target_user(user_id)
    if not user:
        return Response({"error": "کاربر پیدا نشد."}, status=404)
    note, error = require_note(request.data)
    if error:
        return error

    subscription = active_subscription_for_user(user)
    if not subscription:
        return Response({"error": "این کاربر اشتراک فعال ندارد."}, status=404)

    today = current_local_date()
    subscription.is_active = False
    if subscription.end_date >= today:
        subscription.end_date = today - timedelta(days=1)
    subscription.save(update_fields=["is_active", "end_date"])
    audit_admin_action(
        request,
        "subscription.cancel",
        "UserSubscription",
        subscription.id,
        note,
        {"userId": user.id},
    )
    return Response({"subscription": serialize_admin_subscription(subscription), "user": serialize_admin_user(user)})


@api_view(["GET"])
@require_admin
def admin_support_tickets(request):
    status_value = str(request.GET.get("status") or "").strip()
    query = str(request.GET.get("q") or "").strip()
    tickets = SupportTicket.objects.select_related("user", "assigned_admin").annotate(message_count=Count("messages"))
    if status_value in VALID_STATUSES:
        tickets = tickets.filter(status=status_value)
    if query:
        tickets = tickets.filter(
            Q(title__icontains=query)
            | Q(category__icontains=query)
            | Q(user__name__icontains=query)
            | Q(user__phone__icontains=query)
        )
    return Response({"tickets": [serialize_support_ticket(ticket, admin=True) for ticket in tickets[:100]]})


@api_view(["POST"])
@require_admin
def admin_support_reply(request, ticket_id):
    try:
        ticket = SupportTicket.objects.get(id=ticket_id)
    except SupportTicket.DoesNotExist:
        return Response({"error": "درخواست پشتیبانی پیدا نشد."}, status=404)

    body = str(request.data.get("body") or request.data.get("message") or "").strip()
    if not body:
        return Response({"error": "متن پاسخ الزامی است."}, status=400)
    status_value = str(request.data.get("status") or SupportTicket.STATUS_IN_PROGRESS).strip()
    if status_value not in VALID_STATUSES:
        status_value = SupportTicket.STATUS_IN_PROGRESS

    SupportMessage.objects.create(
        ticket=ticket,
        author=request.mentora_user,
        sender_role="admin",
        body=body,
    )
    ticket.status = status_value
    ticket.assigned_admin = request.mentora_user
    ticket.closed_at = timezone.now() if status_value == SupportTicket.STATUS_CLOSED else None
    ticket.save(update_fields=["status", "assigned_admin", "closed_at", "updated_at"])
    audit_admin_action(
        request,
        "support.reply",
        "SupportTicket",
        ticket.id,
        str(request.data.get("note") or "").strip(),
        {"status": status_value},
    )
    return Response({"ticket": serialize_support_ticket(ticket, include_messages=True, admin=True)})


@api_view(["GET", "PATCH"])
@require_admin
def admin_support_update(request, ticket_id):
    try:
        ticket = SupportTicket.objects.get(id=ticket_id)
    except SupportTicket.DoesNotExist:
        return Response({"error": "درخواست پشتیبانی پیدا نشد."}, status=404)

    if request.method == "GET":
        return Response({"ticket": serialize_support_ticket(ticket, include_messages=True, admin=True)})

    changes = {}
    status_value = request.data.get("status")
    if status_value is not None:
        status_value = str(status_value).strip()
        if status_value not in VALID_STATUSES:
            return Response({"error": "وضعیت تیکت معتبر نیست."}, status=400)
        ticket.status = status_value
        ticket.closed_at = timezone.now() if status_value == SupportTicket.STATUS_CLOSED else None
        changes["status"] = status_value
    if "priority" in request.data:
        ticket.priority = str(request.data.get("priority") or "normal").strip()[:30]
        changes["priority"] = ticket.priority
    if "internalNote" in request.data or "internal_note" in request.data:
        ticket.internal_note = str(request.data.get("internalNote") or request.data.get("internal_note") or "").strip()
        changes["internalNote"] = ticket.internal_note
    if request.data.get("assignToMe"):
        ticket.assigned_admin = request.mentora_user
        changes["assignedAdminId"] = request.mentora_user.id

    ticket.save()
    audit_admin_action(
        request,
        "support.update",
        "SupportTicket",
        ticket.id,
        str(request.data.get("note") or "").strip(),
        changes,
    )
    return Response({"ticket": serialize_support_ticket(ticket, include_messages=True, admin=True)})


@api_view(["GET"])
@require_admin
def admin_api_usage(request):
    logs = ApiUsageLog.objects.select_related("user").all()
    provider = str(request.GET.get("provider") or "").strip()
    status_value = str(request.GET.get("status") or "").strip()
    operation = str(request.GET.get("operation") or "").strip()
    if provider:
        logs = logs.filter(provider=provider)
    if status_value:
        logs = logs.filter(status=status_value)
    if operation:
        logs = logs.filter(operation=operation)

    total = logs.count()
    errors = logs.filter(status=ApiUsageLog.STATUS_ERROR).count()
    token_total = sum(log.total_tokens for log in logs[:500])
    return Response({
        "summary": {
            "total": total,
            "errors": errors,
            "errorRate": round((errors / total) * 100, 1) if total else 0,
            "sampledTotalTokens": token_total,
        },
        "logs": [serialize_api_usage(log) for log in logs[:100]],
    })


@api_view(["GET"])
@require_admin
def admin_errors(request):
    return Response({
        "modelErrors": [
            serialize_api_usage(log)
            for log in ApiUsageLog.objects.select_related("user").filter(status=ApiUsageLog.STATUS_ERROR)[:100]
        ],
        "appEvents": [
            serialize_app_event(event)
            for event in AppEventLog.objects.select_related("user").filter(level__in=["error", "critical", "warning"])[:100]
        ],
    })


@api_view(["GET"])
@require_admin
def admin_audit_logs(request):
    action = str(request.GET.get("action") or "").strip()
    logs = AdminAuditLog.objects.select_related("admin_user").all()
    if action:
        logs = logs.filter(action=action)
    return Response({"logs": [serialize_audit_log(log) for log in logs[:100]]})


@api_view(["GET"])
@require_admin
def admin_providers(request):
    recent_errors = ApiUsageLog.objects.filter(status=ApiUsageLog.STATUS_ERROR).values("provider").annotate(count=Count("id"))
    errors_by_provider = {item["provider"]: item["count"] for item in recent_errors}
    providers = []
    for provider in provider_statuses():
        providers.append({
            **provider,
            "recentErrorCount": errors_by_provider.get(provider["provider"], 0),
        })
    return Response({"providers": providers, "logRetentionDays": LOG_RETENTION_DAYS})
