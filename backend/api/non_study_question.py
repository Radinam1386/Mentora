from .model_providers import ModelProviderConfigError, generate_google_content
from .question_router import QuestionRouterConfigError
from .rag_common import (
    GOOGLE_API_VERSION,
    GOOGLE_BASE_URL,
    MAX_RETRIES,
    MODEL_NAME,
    RUNTIME_PROMPTS_DIR,
    image_part as common_image_part,
    load_text,
    question_with_context,
    response_text,
)

NON_STUDY_PROMPT_PATH = RUNTIME_PROMPTS_DIR / "non-study-question.txt"


def answer_non_study_question(
    question_text: str,
    image_bytes: bytes | None = None,
    mime_type: str | None = None,
    file_name: str = "",
    conversation_history: list[dict] | None = None,
) -> str:
    prompt = load_text(NON_STUDY_PROMPT_PATH, error_cls=QuestionRouterConfigError)
    question_for_model = question_with_context(question_text, conversation_history)
    contents = [prompt.replace("{QUESTION_TEXT}", question_for_model or question_text.strip())]

    if image_bytes:
        contents.append(common_image_part(image_bytes, mime_type, file_name, error_cls=QuestionRouterConfigError))

    try:
        response = generate_google_content(
            operation="answer_non_study_question",
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

    return response_text(response).strip()
