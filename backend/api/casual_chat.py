from .model_providers import ModelProviderConfigError, generate_google_content
from .question_router import QuestionRouterConfigError
from .rag_common import (
    GOOGLE_API_VERSION,
    GOOGLE_BASE_URL,
    MAX_RETRIES,
    MODEL_NAME,
    RUNTIME_PROMPTS_DIR,
    load_text,
    question_with_context,
    response_text,
)

CASUAL_CHAT_PROMPT_PATH = RUNTIME_PROMPTS_DIR / "casual-chat.txt"


def answer_casual_chat(question_text: str, conversation_history: list[dict] | None = None) -> str:
    prompt = load_text(CASUAL_CHAT_PROMPT_PATH, error_cls=QuestionRouterConfigError)
    question_for_model = question_with_context(question_text, conversation_history)
    contents = [prompt.replace("{QUESTION_TEXT}", question_for_model or question_text.strip())]

    try:
        response = generate_google_content(
            operation="answer_casual_chat",
            model=MODEL_NAME,
            contents=contents,
            base_url=GOOGLE_BASE_URL,
            api_version=GOOGLE_API_VERSION,
            max_retries=MAX_RETRIES,
            metadata={
                "textChars": len(question_text.strip()),
                "contextMessages": len(conversation_history or []),
                "contentParts": len(contents),
            },
        )
    except ModelProviderConfigError as exc:
        raise QuestionRouterConfigError(str(exc))

    return response_text(response).strip()
