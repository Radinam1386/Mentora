import json
import mimetypes
import os
import re
import time
from pathlib import Path

try:
    from google.genai import types
except ImportError:
    types = None

from .model_providers import ModelProviderConfigError, generate_google_content

REPO_DIR = Path(__file__).resolve().parents[2]
RAG_DIR = REPO_DIR / "RAG"


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
MAX_CARDS_PER_SUBSUBJECT = env_int("RAG_MAX_CARDS_PER_SUBSUBJECT", 10000)
MAX_SOURCE_CHARS = env_int("RAG_MAX_SOURCE_CHARS", 10000000)
INCLUDE_SOURCE_IMAGES = os.environ.get("RAG_INCLUDE_SOURCE_IMAGES", "true").lower() in {"1", "true", "yes"}
MAX_SOURCE_IMAGES = env_int("RAG_MAX_SOURCE_IMAGES", 10000)
MAX_RETRIES = env_int("RAG_MAX_RETRIES", env_int("RAG_MAX_RETRY", 2))
RAG_DEBUG = env_bool("RAG_DEBUG", False)

TOPIC_PROMPT_PATH = RAG_DIR / "Topic-Classifier-Prompt.txt"
SOLVE_PROMPT_PATH = RAG_DIR / "Solve-Question-Prompt.txt"
TOPICS_PATH = RAG_DIR / "Topics" / "all-topics.json"
INDEX_FILES = {
    "math": RAG_DIR / "math-subsubject-index.json",
    "physics": RAG_DIR / "physics-subsubject-index.json",
    "biology": RAG_DIR / "biology-subsubject-index.json",
    "chemistry": RAG_DIR / "chemistry-subsubject-index.json",
}


class QuestionSolverConfigError(Exception):
    pass


def debug_log(message: str, **fields) -> None:
    if not RAG_DEBUG:
        return

    suffix = ""
    if fields:
        safe_fields = " ".join(f"{key}={value}" for key, value in fields.items())
        suffix = f" | {safe_fields}"
    print(f"[RAG DEBUG] {message}{suffix}", flush=True)


def load_text(path: Path) -> str:
    if not path.exists():
        raise QuestionSolverConfigError(f"Missing RAG file: {path}")
    return path.read_text(encoding="utf-8")


def load_json(path: Path) -> dict:
    return json.loads(load_text(path))


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


def resolve_rag_path(path_text: str) -> Path:
    path = Path(path_text)
    if path.is_absolute():
        return path

    candidates = [RAG_DIR / path]
    normalized = path_text.replace("\\", "/")
    replacements = [
        ("cards/", "Cards/"),
        ("Cards/", "Cards/"),
        ("books/", "Books/"),
        ("Books/", "Books/"),
    ]
    for old, new in replacements:
        if normalized.startswith(old):
            candidates.append(RAG_DIR / normalized.replace(old, new, 1))

    for candidate in candidates:
        if candidate.exists():
            return candidate

    return candidates[-1]


def image_part(image_bytes: bytes, mime_type: str | None, file_name: str = ""):
    if types is None:
        raise QuestionSolverConfigError("google-genai is not installed. Run: pip install -r backend/requirements.txt")
    detected_mime = mime_type or mimetypes.guess_type(file_name)[0] or "image/png"
    return types.Part.from_bytes(data=image_bytes, mime_type=detected_mime)


def classify_question(question_text: str, image_bytes: bytes | None, mime_type: str | None, file_name: str) -> dict:
    topics_json = load_text(TOPICS_PATH)
    prompt = load_text(TOPIC_PROMPT_PATH).replace("{TOPICS_JSON}", topics_json)
    contents = [prompt]

    if image_bytes:
        contents.append(image_part(image_bytes, mime_type, file_name))
    if question_text.strip():
        contents.append("Student question:\n" + question_text.strip())

    debug_log(
        "classification prepared",
        text_chars=len(question_text.strip()),
        has_image=bool(image_bytes),
        file_name=file_name or "-",
        content_parts=len(contents),
    )

    try:
        response = generate_google_content(
            operation="classify_question",
            model=MODEL_NAME,
            contents=contents,
            base_url=GOOGLE_BASE_URL,
            api_version=GOOGLE_API_VERSION,
            max_retries=MAX_RETRIES,
            metadata={
                "hasImage": bool(image_bytes),
                "textChars": len(question_text.strip()),
                "contentParts": len(contents),
            },
        )
    except ModelProviderConfigError as exc:
        raise QuestionSolverConfigError(str(exc))

    result = clean_json_response(response_text(response))
    debug_log(
        "classification result",
        main_subject=result.get("main_subject"),
        subsubjects=len(result.get("subsubjects", []) or []),
    )
    return result


def selected_subsubjects(classified_topics: dict) -> list[str]:
    items = classified_topics.get("subsubjects", [])
    sorted_items = sorted(items, key=lambda item: item.get("score", 0), reverse=True)
    selected = []

    for item in sorted_items:
        subsubject = item.get("subsubject")
        if subsubject and subsubject not in selected:
            selected.append(subsubject)

    return selected


def load_relevant_cards(classified_topics: dict) -> tuple[list[dict], list[str]]:
    subject = classified_topics.get("main_subject")
    index_path = INDEX_FILES.get(subject)
    if not index_path:
        raise ValueError(f"Unsupported main_subject from classifier: {subject}")

    selected = selected_subsubjects(classified_topics)
    debug_log(
        "loading relevant cards",
        subject=subject,
        selected_subsubjects=len(selected),
        index=index_path.name,
    )

    index = load_json(index_path)
    groups = index.get("groups", {})
    cards = []
    image_paths = []
    seen_cards = set()

    for subsubject in selected:
        group = groups.get(subsubject)
        if not group:
            debug_log("subsubject has no card group", subsubject=subsubject)
            continue

        loaded_for_subsubject = 0
        for card_file in group.get("json_files", [])[:MAX_CARDS_PER_SUBSUBJECT]:
            if card_file in seen_cards:
                continue
            seen_cards.add(card_file)
            card_path = resolve_rag_path(card_file)
            if card_path.exists():
                card = load_json(card_path)
                if card.get("card_id"):
                    cards.append(card)
                    loaded_for_subsubject += 1

        for image_file in group.get("image_files", []):
            if image_file and image_file not in image_paths:
                image_paths.append(image_file)

        debug_log(
            "subsubject cards loaded",
            subsubject=subsubject,
            cards=loaded_for_subsubject,
            total_cards=len(cards),
            total_images=len(image_paths),
        )

    debug_log(
        "relevant cards ready",
        cards=len(cards),
        image_paths=min(len(image_paths), MAX_SOURCE_IMAGES),
        max_source_images=MAX_SOURCE_IMAGES,
    )
    return cards, image_paths[:MAX_SOURCE_IMAGES]


def cards_to_text(cards: list[dict]) -> tuple[str, list[dict]]:
    parts = []
    used_sources = []
    current_length = 0

    for card in cards:
        card_text = "\n".join(
            [
                f"card_id: {card.get('card_id')}",
                f"tag: {card.get('tag')}",
                f"summary: {card.get('summary')}",
                "key_points:",
                json.dumps(card.get("key_points", []), ensure_ascii=False),
                "main_text:",
                card.get("main_text", ""),
                "other_details:",
                json.dumps(card.get("other_details", []), ensure_ascii=False),
            ]
        )
        if current_length + len(card_text) > MAX_SOURCE_CHARS and parts:
            break

        parts.append(card_text)
        current_length += len(card_text)
        used_sources.append(
            {
                "card_id": card.get("card_id"),
                "tag": card.get("tag"),
                "source_page": card.get("source_page"),
                "image_path": card.get("image_path"),
            }
        )

    sources_text = "\n\n---\n\n".join(parts)
    debug_log(
        "cards converted to source text",
        used_sources=len(used_sources),
        source_chars=len(sources_text),
        max_source_chars=MAX_SOURCE_CHARS,
    )
    return sources_text, used_sources


def solve_with_sources(
    question_text: str,
    image_bytes: bytes | None,
    mime_type: str | None,
    file_name: str,
    classified_topics: dict,
    cards: list[dict],
    image_paths: list[str],
) -> tuple[str, list[dict]]:
    sources_text, used_sources = cards_to_text(cards)
    prompt = (
        load_text(SOLVE_PROMPT_PATH)
        .replace("{CLASSIFIED_TOPICS}", json.dumps(classified_topics, ensure_ascii=False, indent=2))
        .replace("{SOURCES}", sources_text or "No relevant source cards were found.")
        .replace("{QUESTION_TEXT}", question_text.strip())
    )

    contents = [prompt]
    if image_bytes:
        contents.append(image_part(image_bytes, mime_type, file_name))

    attached_images = 0
    if INCLUDE_SOURCE_IMAGES:
        for image_path_text in image_paths:
            source_path = resolve_rag_path(image_path_text)
            if source_path.exists():
                contents.append(image_part(source_path.read_bytes(), None, source_path.name))
                attached_images += 1

    debug_log(
        "solve prompt prepared",
        prompt_chars=len(prompt),
        used_sources=len(used_sources),
        source_image_candidates=len(image_paths),
        attached_source_images=attached_images,
        content_parts=len(contents),
    )

    try:
        response = generate_google_content(
            operation="solve_with_sources",
            model=MODEL_NAME,
            contents=contents,
            base_url=GOOGLE_BASE_URL,
            api_version=GOOGLE_API_VERSION,
            max_retries=MAX_RETRIES,
            metadata={
                "hasImage": bool(image_bytes),
                "usedSources": len(used_sources),
                "attachedSourceImages": attached_images,
                "contentParts": len(contents),
            },
        )
    except ModelProviderConfigError as exc:
        raise QuestionSolverConfigError(str(exc))

    answer = response_text(response)
    debug_log("solve result ready", answer_chars=len(answer), sources=len(used_sources))
    return answer, used_sources


def solve_student_question(question_text: str, uploaded_file=None) -> dict:
    started_at = time.perf_counter()
    image_bytes = None
    mime_type = None
    file_name = ""

    if uploaded_file:
        image_bytes = uploaded_file.read()
        mime_type = getattr(uploaded_file, "content_type", None)
        file_name = getattr(uploaded_file, "name", "")

    if not question_text.strip() and not image_bytes:
        raise ValueError("Question text or image is required.")

    debug_log(
        "student question solve started",
        text_chars=len(question_text.strip()),
        has_image=bool(image_bytes),
        image_bytes=len(image_bytes) if image_bytes else 0,
        mime_type=mime_type or "-",
        file_name=file_name or "-",
        max_retries=MAX_RETRIES,
    )

    classified_topics = classify_question(question_text, image_bytes, mime_type, file_name)
    cards, image_paths = load_relevant_cards(classified_topics)
    answer, sources = solve_with_sources(
        question_text,
        image_bytes,
        mime_type,
        file_name,
        classified_topics,
        cards,
        image_paths,
    )

    result = {
        "reply": answer,
        "classified_topics": classified_topics,
        "sources": sources,
        "source_count": len(sources),
    }
    debug_log(
        "student question solve finished",
        elapsed_ms=round((time.perf_counter() - started_at) * 1000),
        source_count=len(sources),
        reply_chars=len(answer),
    )
    return result
