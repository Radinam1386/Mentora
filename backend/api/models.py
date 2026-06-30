# backend/api/models.py
import random
from datetime import timedelta

from django.db import models
from django.utils import timezone


class User(models.Model):
    name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, unique=True)          # ← unique شد
    email = models.CharField(max_length=255, blank=True)          # ← دیگه unique نیست
    password = models.CharField(max_length=128, blank=True)
    bio = models.TextField(blank=True)
    grade = models.CharField(max_length=100, blank=True)
    major = models.CharField(max_length=100, blank=True)
    target_rank = models.CharField(max_length=100, blank=True)
    daily_study_hours = models.IntegerField(default=4)
    onboarding_completed = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)        # ← جدید
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class OTPCode(models.Model):
    phone = models.CharField(max_length=20)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    @staticmethod
    def generate_code():
        return str(random.randint(100000, 999999))

    def is_valid(self):
        expiry = self.created_at + timedelta(minutes=10)
        return not self.is_used and timezone.now() < expiry


class DailyTask(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    duration = models.CharField(max_length=100)
    is_completed = models.BooleanField(default=False)
    category = models.CharField(max_length=100)
    scheduled_date = models.DateField()


class WeeklyPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="weekly_plans")
    status = models.TextField(blank=True)
    recommendations = models.JSONField(default=list)
    daily_plan = models.JSONField(default=list)
    markdown = models.TextField(blank=True)
    source = models.CharField(max_length=50, default="rule_based")
    start_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    slug = models.CharField(max_length=50, unique=True)
    duration_days = models.IntegerField()
    price = models.IntegerField()
    highlight = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class UserSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True, blank=True)
    plan_name = models.CharField(max_length=100)
    price = models.IntegerField(default=0)
    total_days = models.IntegerField(default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_messages")
    role = models.CharField(max_length=20)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class QuizQuestion(models.Model):
    major = models.CharField(max_length=50, blank=True, default="", db_index=True)
    lesson = models.CharField(max_length=100, blank=True, default="", db_index=True)
    grade = models.CharField(max_length=50, blank=True, default="", db_index=True)
    topic = models.CharField(max_length=255, blank=True, default="", db_index=True)
    question_image = models.CharField(max_length=500, blank=True, default="")
    correct_answer_index = models.IntegerField()
    explanation = models.TextField(blank=True, default="")
    difficulty = models.CharField(max_length=50, blank=True, default="")


class DiagnosticTest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.CharField(max_length=255)
    number_of_questions = models.IntegerField(default=12)
    correct_answers = models.IntegerField(default=0)
    readiness_percentage = models.FloatField(default=0.0)
    tested_at = models.DateTimeField(auto_now_add=True)


class SupportTicket(models.Model):
    STATUS_OPEN = "open"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_RESOLVED = "resolved"
    STATUS_CLOSED = "closed"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="support_tickets")
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, default="عمومی")
    status = models.CharField(max_length=30, default=STATUS_OPEN, db_index=True)
    priority = models.CharField(max_length=30, blank=True, default="normal")
    internal_note = models.TextField(blank=True, default="")
    assigned_admin = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_support_tickets",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]


class SupportMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    sender_role = models.CharField(max_length=20)
    body = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class AdminAuditLog(models.Model):
    admin_user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="admin_audit_logs",
    )
    action = models.CharField(max_length=100, db_index=True)
    target_type = models.CharField(max_length=100, blank=True, default="")
    target_id = models.CharField(max_length=100, blank=True, default="")
    note = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.CharField(max_length=64, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class ApiUsageLog(models.Model):
    STATUS_SUCCESS = "success"
    STATUS_ERROR = "error"

    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="api_usage_logs")
    provider = models.CharField(max_length=80, db_index=True)
    sdk = models.CharField(max_length=80, blank=True, default="")
    model = models.CharField(max_length=120, blank=True, default="")
    operation = models.CharField(max_length=120, db_index=True)
    key_fingerprint = models.CharField(max_length=40, blank=True, default="")
    status = models.CharField(max_length=20, default=STATUS_SUCCESS, db_index=True)
    latency_ms = models.IntegerField(default=0)
    retry_count = models.IntegerField(default=0)
    prompt_tokens = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    total_tokens = models.IntegerField(default=0)
    response_id = models.CharField(max_length=180, blank=True, default="")
    finish_reason = models.CharField(max_length=100, blank=True, default="")
    error_type = models.CharField(max_length=120, blank=True, default="")
    error_message = models.TextField(blank=True, default="")
    http_status = models.IntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["created_at", "status"]),
            models.Index(fields=["provider", "operation"]),
        ]


class AppEventLog(models.Model):
    level = models.CharField(max_length=20, default="info", db_index=True)
    source = models.CharField(max_length=80, blank=True, default="")
    event_type = models.CharField(max_length=120, db_index=True)
    message = models.TextField(blank=True, default="")
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="app_event_logs")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
