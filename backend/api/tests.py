import json
import os
import weakref
from datetime import timedelta
from unittest.mock import patch

from django.test import Client, TestCase
from django.utils import timezone

from .auth_utils import generate_token, hash_password
from .model_providers import ModelProviderConfigError, generate_google_content, generate_openai_chat
from .models import AdminAuditLog, ApiUsageLog, SubscriptionPlan, SupportTicket, User, UserSubscription


class AdminConsoleTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create(
            name="Admin",
            phone="09120000000",
            password=hash_password("secret123"),
            is_admin=True,
        )
        self.user = User.objects.create(
            name="Student",
            phone="09121111111",
            password=hash_password("secret123"),
        )
        self.other_user = User.objects.create(
            name="Other",
            phone="09122222222",
            password=hash_password("secret123"),
        )
        self.plan = SubscriptionPlan.objects.create(
            name="ماهانه",
            slug="test_monthly",
            duration_days=30,
            price=100000,
            is_active=True,
        )

    def auth_headers(self, user):
        return {"HTTP_AUTHORIZATION": f"Bearer {generate_token(user)}"}

    def post_json(self, path, user, payload):
        return self.client.post(
            path,
            data=json.dumps(payload),
            content_type="application/json",
            **self.auth_headers(user),
        )

    def test_non_admin_cannot_access_admin_api(self):
        response = self.client.get("/api/admin/me", **self.auth_headers(self.user))
        self.assertEqual(response.status_code, 403)

    def test_admin_can_access_dashboard(self):
        response = self.client.get("/api/admin/dashboard", **self.auth_headers(self.admin))
        self.assertEqual(response.status_code, 200)
        self.assertIn("summary", response.json())

    def test_subscription_extend_updates_target_and_writes_audit_log(self):
        today = timezone.localdate()
        target_subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            plan_name=self.plan.name,
            price=self.plan.price,
            total_days=30,
            start_date=today,
            end_date=today + timedelta(days=29),
            is_active=True,
        )
        other_subscription = UserSubscription.objects.create(
            user=self.other_user,
            plan=self.plan,
            plan_name=self.plan.name,
            price=self.plan.price,
            total_days=30,
            start_date=today,
            end_date=today + timedelta(days=29),
            is_active=True,
        )

        response = self.post_json(
            f"/api/admin/users/{self.user.id}/subscriptions/extend",
            self.admin,
            {"days": 5, "note": "manual extension"},
        )

        self.assertEqual(response.status_code, 200)
        target_subscription.refresh_from_db()
        other_subscription.refresh_from_db()
        self.assertEqual(target_subscription.total_days, 35)
        self.assertEqual(target_subscription.end_date, today + timedelta(days=34))
        self.assertEqual(other_subscription.total_days, 30)
        self.assertTrue(AdminAuditLog.objects.filter(action="subscription.extend", admin_user=self.admin).exists())

    def test_support_ticket_preserves_user_and_admin_messages(self):
        create_response = self.post_json(
            "/api/support/tickets",
            self.user,
            {"title": "مشکل مربی", "category": "مربی هوشمند", "body": "پاسخ نمی‌دهد."},
        )
        self.assertEqual(create_response.status_code, 201)
        ticket_id = create_response.json()["ticket"]["id"]

        admin_response = self.post_json(
            f"/api/admin/support/tickets/{ticket_id}/reply",
            self.admin,
            {"body": "در حال بررسی است.", "status": "in_progress"},
        )
        self.assertEqual(admin_response.status_code, 200)

        detail_response = self.client.get(f"/api/support/tickets/{ticket_id}", **self.auth_headers(self.user))
        self.assertEqual(detail_response.status_code, 200)
        messages = detail_response.json()["ticket"]["messages"]
        self.assertEqual([message["senderRole"] for message in messages], ["user", "admin"])

        other_detail = self.client.get(f"/api/support/tickets/{ticket_id}", **self.auth_headers(self.other_user))
        self.assertEqual(other_detail.status_code, 404)
        self.assertEqual(SupportTicket.objects.get(id=ticket_id).status, SupportTicket.STATUS_IN_PROGRESS)

    def test_user_cannot_reply_to_closed_ticket(self):
        create_response = self.post_json(
            "/api/support/tickets",
            self.user,
            {"title": "بستن تیکت", "category": "عمومی", "body": "لطفاً ببندید."},
        )
        self.assertEqual(create_response.status_code, 201)
        ticket_id = create_response.json()["ticket"]["id"]

        close_response = self.post_json(
            f"/api/admin/support/tickets/{ticket_id}/reply",
            self.admin,
            {"body": "بسته شد.", "status": "closed"},
        )
        self.assertEqual(close_response.status_code, 200)

        user_reply = self.post_json(
            f"/api/support/tickets/{ticket_id}/messages",
            self.user,
            {"body": "پیام بعد از بسته شدن"},
        )
        self.assertEqual(user_reply.status_code, 400)
        self.assertEqual(SupportTicket.objects.get(id=ticket_id).status, SupportTicket.STATUS_CLOSED)

    def test_missing_openai_provider_key_is_logged_without_raw_secret(self):
        before_count = ApiUsageLog.objects.count()
        with patch.dict(os.environ, {"MODEL_API": ""}, clear=False):
            with self.assertRaises(ModelProviderConfigError):
                generate_openai_chat(operation="test_missing_key", prompt="hello")

        self.assertEqual(ApiUsageLog.objects.count(), before_count + 1)
        log = ApiUsageLog.objects.latest("created_at")
        self.assertEqual(log.status, ApiUsageLog.STATUS_ERROR)
        self.assertEqual(log.key_fingerprint, "missing")
        self.assertIn("MODEL_API", log.error_message)

    def test_google_provider_keeps_client_alive_for_request(self):
        class FakeModels:
            def __init__(self, client):
                self.client_ref = weakref.ref(client)

            def generate_content(self, model, contents):
                client = self.client_ref()
                if client is None or client.closed:
                    raise RuntimeError("Cannot send a request, as the client has been closed.")
                return type("FakeResponse", (), {"text": "ok", "candidates": []})()

        class FakeClient:
            def __init__(self):
                self.closed = False

            @property
            def models(self):
                return FakeModels(self)

            def __del__(self):
                self.closed = True

        with patch("api.model_providers.google_api_keys", return_value=["fake-key"]):
            with patch("api.model_providers.google_client", return_value=FakeClient()):
                response = generate_google_content(
                    operation="test_google_lifecycle",
                    model="fake-model",
                    contents=["hello"],
                )

        self.assertEqual(response.text, "ok")
        self.assertTrue(
            ApiUsageLog.objects.filter(
                provider="google",
                operation="test_google_lifecycle",
                status=ApiUsageLog.STATUS_SUCCESS,
            ).exists()
        )
