import json
import os
import tempfile
import weakref
from datetime import timedelta
from pathlib import Path
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.test import Client, TestCase
from django.utils import timezone

from .auth_utils import generate_token, hash_password
from .casual_chat import CASUAL_CHAT_PROMPT_PATH, answer_casual_chat
from .model_providers import ModelProviderConfigError, generate_google_content, generate_openai_chat
from .models import AdminAuditLog, ApiUsageLog, ChatMessage, ChatSession, SubscriptionPlan, SupportTicket, User, UserSubscription
from .non_study_question import NON_STUDY_PROMPT_PATH
from .question_router import (
    QUESTION_ROUTER_PROMPT_PATH,
    classify_question,
)
from .question_solver import SOLVE_PROMPT_PATH, solve_student_question, source_images_for_model


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

    def test_tutor_chat_sessions_save_and_continue_with_recent_context(self):
        create_response = self.post_json("/api/tutor/sessions", self.user, {})
        self.assertEqual(create_response.status_code, 201)
        session_id = create_response.json()["session"]["id"]

        with patch("api.views.solve_student_question", return_value={
            "reply": "پاسخ اول",
            "classified_topics": {"main_subject": "math"},
            "sources": [],
            "source_count": 0,
        }) as first_solver:
            first_response = self.post_json(
                "/api/tutor/chat",
                self.user,
                {"sessionId": session_id, "message": "حد تابع چیست؟"},
            )

        self.assertEqual(first_response.status_code, 200)
        first_solver.assert_called_once()
        self.assertEqual(ChatSession.objects.get(id=session_id).messages.count(), 2)

        with patch("api.views.solve_student_question", return_value={
            "reply": "پاسخ ادامه",
            "classified_topics": {"main_subject": "math"},
            "sources": [],
            "source_count": 0,
        }) as second_solver:
            second_response = self.post_json(
                "/api/tutor/chat",
                self.user,
                {"sessionId": session_id, "message": "ساده‌تر بگو"},
            )

        self.assertEqual(second_response.status_code, 200)
        second_solver.assert_called_once()
        context = second_solver.call_args.kwargs["conversation_history"]
        self.assertEqual([item["role"] for item in context], ["user", "assistant"])
        self.assertIn("حد تابع", context[0]["content"])
        self.assertEqual(ChatMessage.objects.filter(session_id=session_id).count(), 4)

        detail_response = self.client.get(f"/api/tutor/sessions/{session_id}", **self.auth_headers(self.user))
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(len(detail_response.json()["session"]["messages"]), 4)

        delete_response = self.client.delete(f"/api/tutor/sessions/{session_id}", **self.auth_headers(self.user))
        self.assertEqual(delete_response.status_code, 200)
        self.assertFalse(ChatSession.objects.filter(id=session_id, is_deleted=False).exists())

    def test_tutor_chat_persists_uploaded_image_on_saved_message(self):
        create_response = self.post_json("/api/tutor/sessions", self.user, {})
        self.assertEqual(create_response.status_code, 201)
        session_id = create_response.json()["session"]["id"]
        image_bytes = b"fake image bytes"

        def fake_solver(question, image, conversation_history=None):
            self.assertEqual(question, "این سوال تصویری را حل کن")
            self.assertEqual(image.read(), image_bytes)
            return {
                "reply": "پاسخ تصویری",
                "classified_topics": {"main_subject": "math"},
                "sources": [],
                "source_count": 0,
            }

        with tempfile.TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=Path(media_root)):
                upload = SimpleUploadedFile(
                    "question.png",
                    image_bytes,
                    content_type="image/png",
                )
                with patch("api.views.solve_student_question", side_effect=fake_solver):
                    response = self.client.post(
                        "/api/tutor/chat",
                        data={
                            "sessionId": session_id,
                            "message": "این سوال تصویری را حل کن",
                            "image": upload,
                        },
                        **self.auth_headers(self.user),
                    )

                self.assertEqual(response.status_code, 200)
                user_payload = response.json()["userMessage"]
                self.assertTrue(user_payload["imageUrl"].startswith("/media/tutor_uploads/"))

                user_message = ChatMessage.objects.get(session_id=session_id, role="user")
                saved_path = user_message.metadata["image_path"]
                self.assertTrue((Path(media_root) / saved_path).exists())
                media_response = self.client.get(user_payload["imageUrl"])
                self.assertEqual(media_response.status_code, 200)
                self.assertEqual(b"".join(media_response.streaming_content), image_bytes)

                detail_response = self.client.get(
                    f"/api/tutor/sessions/{session_id}",
                    **self.auth_headers(self.user),
                )
                self.assertEqual(detail_response.status_code, 200)
                saved_messages = detail_response.json()["session"]["messages"]
                self.assertEqual(saved_messages[0]["imageUrl"], user_payload["imageUrl"])

    def test_rag_source_images_only_go_to_biology_and_chemistry(self):
        image_paths = ["cards/page-1.png", "cards/page-2.png"]

        with patch("api.question_solver.INCLUDE_SOURCE_IMAGES", True):
            self.assertEqual(
                source_images_for_model({"main_subject": "biology"}, image_paths),
                image_paths,
            )
            self.assertEqual(
                source_images_for_model({"main_subject": "chemistry"}, image_paths),
                image_paths,
            )
            self.assertEqual(source_images_for_model({"main_subject": "math"}, image_paths), [])
            self.assertEqual(source_images_for_model({"main_subject": "physics"}, image_paths), [])

        with patch("api.question_solver.INCLUDE_SOURCE_IMAGES", False):
            self.assertEqual(source_images_for_model({"main_subject": "biology"}, image_paths), [])

    def test_rag_prompt_allows_internal_knowledge_without_fixed_warning(self):
        prompt = SOLVE_PROMPT_PATH.read_text(encoding="utf-8")

        self.assertIn("Only if the provided sources/attachments genuinely do not contain enough information", prompt)
        self.assertIn("Do not use internal knowledge when the provided sources are enough", prompt)
        self.assertIn("Do not add a fixed fallback warning", prompt)
        self.assertNotIn("من نتونستم دقیقاً منبع مورد نیاز برای این بخش رو از کتاب‌های درسی پیدا کنم", prompt)

    def test_router_can_identify_simple_casual_messages(self):
        with patch("api.question_router.generate_google_content") as model_call:
            route = classify_question("سلام", None, None, "")

        model_call.assert_not_called()
        self.assertEqual(route["route"], "casual_chat")

    def test_casual_chat_answerer_uses_model_call(self):
        fake_response = type("FakeResponse", (), {"text": "سلام رفیق، خوش اومدی!"})()

        with patch("api.casual_chat.generate_google_content", return_value=fake_response) as model_call:
            answer = answer_casual_chat("سلام")

        model_call.assert_called_once()
        self.assertEqual(answer, "سلام رفیق، خوش اومدی!")

    def test_non_study_route_uses_separate_internal_knowledge_answerer(self):
        routed = {
            "route": "non_study_question",
            "main_subject": None,
            "subsubjects": [],
            "question_type": "general",
            "confidence": 0.95,
        }
        answer = "پاریس پایتخت فرانسه است."

        with patch("api.question_solver.classify_question", return_value=routed):
            with patch("api.question_solver.answer_non_study_question", return_value=answer) as answerer:
                result = solve_student_question("پایتخت فرانسه کجاست؟")

        answerer.assert_called_once()
        self.assertEqual(result["route"], "non_study_question")
        self.assertEqual(result["source_count"], 0)
        self.assertEqual(result["reply"], answer)

    def test_router_and_answer_prompts_keep_friendly_guardrails(self):
        solve_prompt = SOLVE_PROMPT_PATH.read_text(encoding="utf-8")
        router_prompt = QUESTION_ROUTER_PROMPT_PATH.read_text(encoding="utf-8")
        non_study_prompt = NON_STUDY_PROMPT_PATH.read_text(encoding="utf-8")

        self.assertIn("cool older study friend", solve_prompt)
        self.assertIn('"casual_chat"', router_prompt)
        self.assertIn('"non_study_question"', router_prompt)
        self.assertIn("Do not start every answer with a fixed warning", non_study_prompt)
        self.assertNotIn("Start every answer with this warning", non_study_prompt)
        self.assertIn("Light slang is okay", non_study_prompt)
        self.assertIn("warm Persian study companion", CASUAL_CHAT_PROMPT_PATH.read_text(encoding="utf-8"))

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
