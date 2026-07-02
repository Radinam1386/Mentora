import re

from .model_providers import ModelProviderConfigError, generate_google_content
from .rag_common import (
    GOOGLE_API_VERSION,
    GOOGLE_BASE_URL,
    MAX_RETRIES,
    MODEL_NAME,
    RUNTIME_PROMPTS_DIR,
    TOPICS_PATH,
    RagConfigError,
    clean_json_response,
    image_part as common_image_part,
    load_text,
    question_with_context,
    response_text,
)

QUESTION_ROUTER_PROMPT_PATH = RUNTIME_PROMPTS_DIR / "question-router.txt"

STUDY_ROUTE = "study_question"
CASUAL_ROUTE = "casual_chat"
NON_STUDY_ROUTE = "non_study_question"
SUPPORT_ROUTE = "support_or_account"
UNSAFE_ROUTE = "unsafe"
ROUTES = {STUDY_ROUTE, CASUAL_ROUTE, NON_STUDY_ROUTE, SUPPORT_ROUTE, UNSAFE_ROUTE}
STUDY_SUBJECTS = {"math", "physics", "biology", "chemistry"}


class QuestionRouterConfigError(RagConfigError):
    pass


def image_part(image_bytes: bytes, mime_type: str | None, file_name: str = ""):
    return common_image_part(image_bytes, mime_type, file_name, error_cls=QuestionRouterConfigError)


def normalized_short_text(text: str) -> str:
    return re.sub(r"\s+", " ", str(text or "").strip().lower().strip(" .!؟?،,؛;:"))


def quick_casual_route(question_text: str, has_image: bool) -> dict | None:
    if has_image:
        return None

    normalized = normalized_short_text(question_text)
    greetings = {"سلام", "hi", "hello", "hey", "سلامی", "درود", "سلااام"}
    thanks = {"مرسی", "ممنون", "دمت گرم", "تشکر", "قربونت", "thank you", "thanks", "tnx"}
    goodbyes = {"خداحافظ", "فعلا", "bye", "goodbye"}
    how_are_you = {"خوبی", "چطوری", "حالت چطوره", "چه خبر", "خوبی؟"}
    who_are_you = {"تو کی هستی", "کی هستی", "اسمت چیه"}

    if normalized in greetings | thanks | goodbyes | how_are_you | who_are_you:
        return {
            "route": CASUAL_ROUTE,
            "main_subject": None,
            "main_subject_confidence": 0.0,
            "subsubjects": [],
            "question_type": "casual",
            "needs_image_reasoning": False,
            "confidence": 1.0,
            "reason": "Short casual message.",
        }
    return None


def normalize_route_result(result: dict) -> dict:
    if not isinstance(result, dict):
        result = {}

    route = str(result.get("route") or "").strip()
    main_subject = result.get("main_subject")
    if not route and main_subject in STUDY_SUBJECTS:
        route = STUDY_ROUTE
    if route not in ROUTES:
        route = STUDY_ROUTE if main_subject in STUDY_SUBJECTS else NON_STUDY_ROUTE

    if route == STUDY_ROUTE:
        main_subject = str(main_subject or "").strip()
        if main_subject not in STUDY_SUBJECTS:
            route = NON_STUDY_ROUTE
            main_subject = None

    if route != STUDY_ROUTE:
        main_subject = None
        result["subsubjects"] = []

    result["route"] = route
    result["main_subject"] = main_subject
    result.setdefault("main_subject_confidence", 0.0)
    result.setdefault("subsubjects", [])
    result.setdefault("question_type", "unknown")
    result.setdefault("needs_image_reasoning", False)
    result.setdefault("confidence", 0.0)
    result.setdefault("reason", "")
    return result


def classify_question(
    question_text: str,
    image_bytes: bytes | None,
    mime_type: str | None,
    file_name: str,
    conversation_history: list[dict] | None = None,
) -> dict:
    quick_route = quick_casual_route(question_text, bool(image_bytes))
    if quick_route:
        return quick_route

    topics_json = load_text(TOPICS_PATH, error_cls=QuestionRouterConfigError)
    prompt = load_text(QUESTION_ROUTER_PROMPT_PATH, error_cls=QuestionRouterConfigError).replace("{TOPICS_JSON}", topics_json)
    question_for_model = question_with_context(question_text, conversation_history, purpose="route")
    contents = [prompt]

    if image_bytes:
        contents.append(image_part(image_bytes, mime_type, file_name))
    if question_for_model:
        contents.append("Student message:\n" + question_for_model)

    try:
        response = generate_google_content(
            operation="route_student_message",
            model=MODEL_NAME,
            contents=contents,
            base_url=GOOGLE_BASE_URL,
            api_version=GOOGLE_API_VERSION,
            max_retries=MAX_RETRIES,
            metadata={
                "hasImage": bool(image_bytes),
                "textChars": len(question_text.strip()),
                "contextMessages": len(conversation_history or []),
                "contentParts": len(contents),
            },
        )
    except ModelProviderConfigError as exc:
        raise QuestionRouterConfigError(str(exc))

    return normalize_route_result(clean_json_response(response_text(response)))


def answer_support_or_account() -> str:
    return (
        "به نظر این یکی بیشتر مربوط به حساب، پرداخت، ورود یا پشتیبانی منتوراست تا سوال درسی. "
        "از بخش پشتیبانی پیام بده تا دقیق‌تر پیگیری بشه؛ منم اگه خواستی می‌تونم کمکت کنم متن تیکت رو مرتب بنویسی."
    )


def answer_unsafe() -> str:
    return (
        "این مورد رو نمی‌تونم راهنمایی کنم، چون ممکنه آسیب‌زا یا ناامن باشه. "
        "اگه هدفت یادگیری یا حل یه مسئله امنه، صورتش رو یه کم عوض کن تا با هم درست و بی‌دردسر جلو بریم."
    )
