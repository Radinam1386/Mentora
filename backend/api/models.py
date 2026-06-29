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
    subject = models.CharField(max_length=255)
    question_text = models.TextField()
    options = models.JSONField(default=list)
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