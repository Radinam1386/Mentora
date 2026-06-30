from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .auth_utils import require_auth
from .models import SupportMessage, SupportTicket


VALID_STATUSES = {
    SupportTicket.STATUS_OPEN,
    SupportTicket.STATUS_IN_PROGRESS,
    SupportTicket.STATUS_RESOLVED,
    SupportTicket.STATUS_CLOSED,
}


def serialize_support_message(message):
    author = message.author
    return {
        "id": message.id,
        "senderRole": message.sender_role,
        "body": message.body,
        "createdAt": message.created_at.isoformat(),
        "author": {
            "id": author.id,
            "name": author.name or author.phone,
        } if author else None,
    }


def serialize_support_ticket(ticket, include_messages=False, admin=False):
    payload = {
        "id": ticket.id,
        "title": ticket.title,
        "category": ticket.category,
        "status": ticket.status,
        "priority": ticket.priority,
        "createdAt": ticket.created_at.isoformat(),
        "updatedAt": ticket.updated_at.isoformat(),
        "closedAt": ticket.closed_at.isoformat() if ticket.closed_at else "",
    }
    if admin:
        payload["user"] = {
            "id": ticket.user.id,
            "name": ticket.user.name or "",
            "phone": ticket.user.phone or "",
            "email": ticket.user.email or "",
        }
        payload["internalNote"] = ticket.internal_note
        payload["assignedAdmin"] = {
            "id": ticket.assigned_admin.id,
            "name": ticket.assigned_admin.name or ticket.assigned_admin.phone,
        } if ticket.assigned_admin else None
    if include_messages:
        messages = ticket.messages.filter(is_internal=False)
        payload["messages"] = [serialize_support_message(message) for message in messages]
    return payload


def get_user_ticket(user, ticket_id):
    try:
        return SupportTicket.objects.get(id=ticket_id, user=user)
    except SupportTicket.DoesNotExist:
        return None


@api_view(["GET", "POST"])
@require_auth
def support_tickets(request):
    user = request.mentora_user
    if request.method == "GET":
        tickets = user.support_tickets.order_by("-updated_at", "-created_at")[:50]
        return Response({"tickets": [serialize_support_ticket(ticket) for ticket in tickets]})

    title = str(request.data.get("title") or "").strip()
    body = str(request.data.get("body") or request.data.get("message") or "").strip()
    category = str(request.data.get("category") or "عمومی").strip()[:100]

    if not title:
        return Response({"error": "عنوان درخواست پشتیبانی الزامی است."}, status=400)
    if not body:
        return Response({"error": "متن پیام پشتیبانی الزامی است."}, status=400)

    ticket = SupportTicket.objects.create(
        user=user,
        title=title[:255],
        category=category or "عمومی",
        status=SupportTicket.STATUS_OPEN,
    )
    SupportMessage.objects.create(
        ticket=ticket,
        author=user,
        sender_role="user",
        body=body,
    )

    return Response({"ticket": serialize_support_ticket(ticket, include_messages=True)}, status=201)


@api_view(["GET"])
@require_auth
def support_ticket_detail(request, ticket_id):
    ticket = get_user_ticket(request.mentora_user, ticket_id)
    if not ticket:
        return Response({"error": "درخواست پشتیبانی پیدا نشد."}, status=404)
    return Response({"ticket": serialize_support_ticket(ticket, include_messages=True)})


@api_view(["POST"])
@require_auth
def support_ticket_messages(request, ticket_id):
    user = request.mentora_user
    ticket = get_user_ticket(user, ticket_id)
    if not ticket:
        return Response({"error": "درخواست پشتیبانی پیدا نشد."}, status=404)

    body = str(request.data.get("body") or request.data.get("message") or "").strip()
    if not body:
        return Response({"error": "متن پیام الزامی است."}, status=400)

    if ticket.status == SupportTicket.STATUS_CLOSED:
        return Response({
            "error": "این تیکت بسته شده و امکان ارسال پاسخ جدید ندارد.",
        }, status=400)

    if ticket.status == SupportTicket.STATUS_RESOLVED:
        ticket.status = SupportTicket.STATUS_OPEN

    ticket.updated_at = timezone.now()
    ticket.save(update_fields=["status", "closed_at", "updated_at"])
    message = SupportMessage.objects.create(
        ticket=ticket,
        author=user,
        sender_role="user",
        body=body,
    )

    return Response({
        "message": serialize_support_message(message),
        "ticket": serialize_support_ticket(ticket, include_messages=True),
    }, status=201)
