import json
import mimetypes
import os
import re
from pathlib import Path

try:
    from google.genai import types
except ImportError:
    types = None

REPO_DIR = Path(__file__).resolve().parents[2]
RAG_DIR = REPO_DIR / "RAG"
RUNTIME_PROMPTS_DIR = RAG_DIR / "prompts" / "runtime"
TOPICS_PATH = RAG_DIR / "Topics" / "all-topics.json"


class RagConfigError(Exception):
    pass


def env_int(name: str, default: int, minimum: int = 0) -> int:
    try:
        return max(minimum, int(os.environ.get(name, str(default))))
    except ValueError:
        return default


def env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


MODEL_NAME = os.environ.get("RAG_MODEL_NAME", "gemma-4-31b-it")
GOOGLE_BASE_URL = os.environ.get("RAG_GOOGLE_BASE_URL", "").strip()
GOOGLE_API_VERSION = os.environ.get("RAG_GOOGLE_API_VERSION", "").strip()
MAX_RETRIES = env_int("RAG_MAX_RETRIES", env_int("RAG_MAX_RETRY", 2))
MAX_CONVERSATION_CONTEXT_MESSAGES = env_int("RAG_CONTEXT_MESSAGES", 6)
MAX_CONVERSATION_CONTEXT_CHARS = env_int("RAG_CONTEXT_CHARS", 6000)


def load_text(path: Path, error_cls=RagConfigError) -> str:
    if not path.exists():
        raise error_cls(f"Missing RAG file: {path}")
    return path.read_text(encoding="utf-8")


def load_json(path: Path, error_cls=RagConfigError) -> dict:
    return json.loads(load_text(path, error_cls=error_cls))


def clean_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"No JSON object found in model response:\n{text}")

    return json.loads(text[start : end + 1])


def response_text(response) -> str:
    text = getattr(response, "text", None)
    if text:
        return text

    texts = []
    for candidate in getattr(response, "candidates", []) or []:
        content = getattr(candidate, "content", None)
        for part in getattr(content, "parts", []) or []:
            part_text = getattr(part, "text", None)
            if part_text:
                texts.append(part_text)

    if texts:
        return "\n".join(texts)

    raise ValueError(f"Google API returned no text. Raw response: {response}")


def image_part(image_bytes: bytes, mime_type: str | None, file_name: str = "", error_cls=RagConfigError):
    if types is None:
        raise error_cls("google-genai is not installed. Run: pip install -r backend/requirements.txt")
    detected_mime = mime_type or mimetypes.guess_type(file_name)[0] or "image/png"
    return types.Part.from_bytes(data=image_bytes, mime_type=detected_mime)


def conversation_context_text(conversation_history: list[dict] | None) -> str:
    if not conversation_history:
        return ""

    role_labels = {
        "user": "Student",
        "assistant": "Mentora",
        "model": "Mentora",
    }
    lines = []
    total_chars = 0

    for message in conversation_history[-MAX_CONVERSATION_CONTEXT_MESSAGES:]:
        content = str(message.get("content") or "").strip()
        if not content:
            continue
        role = role_labels.get(str(message.get("role") or "").strip(), "Mentora")
        line = f"{role}: {content}"
        remaining = MAX_CONVERSATION_CONTEXT_CHARS - total_chars
        if remaining <= 0:
            break
        if len(line) > remaining:
            line = line[:remaining].rstrip()
        lines.append(line)
        total_chars += len(line)

    return "\n".join(lines).strip()


def question_with_context(question_text: str, conversation_history: list[dict] | None = None, purpose="answer") -> str:
    context = conversation_context_text(conversation_history)
    current_question = question_text.strip()
    if not context:
        return current_question

    action = "route or answer" if purpose == "route" else "answer"
    return (
        "Recent conversation context. Use this only to understand follow-up references, "
        f"and {action} the current student message.\n"
        f"{context}\n\n"
        f"Current student message:\n{current_question}"
    ).strip()
