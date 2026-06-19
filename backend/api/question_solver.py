import json
import mimetypes
import os
import re
from pathlib import Path

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None


REPO_DIR = Path(__file__).resolve().parents[2]
RAG_DIR = REPO_DIR / "RAG"

MODEL_NAME = os.environ.get("RAG_MODEL_NAME", "gemma-4-31b-it")
MAX_CARDS_PER_SUBSUBJECT = int(os.environ.get("RAG_MAX_CARDS_PER_SUBSUBJECT", "10000"))
MAX_SOURCE_CHARS = int(os.environ.get("RAG_MAX_SOURCE_CHARS", "10000000"))
INCLUDE_SOURCE_IMAGES = os.environ.get("RAG_INCLUDE_SOURCE_IMAGES", "true").lower() in {"1", "true", "yes"}
MAX_SOURCE_IMAGES = int(os.environ.get("RAG_MAX_SOURCE_IMAGES", "10000"))

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


def api_key() -> str:
    if genai is None or types is None:
        raise QuestionSolverConfigError("google-genai is not installed. Run: pip install -r backend/requirements.txt")

    key = (
        os.environ.get("GOOGLE_API_KEY")
        or os.environ.get("GEMINI_API_KEY")
        or os.environ.get("RAG_GOOGLE_API_KEY")
    )
    if not key:
        raise QuestionSolverConfigError("Google API key is missing. Set GOOGLE_API_KEY, GEMINI_API_KEY, or RAG_GOOGLE_API_KEY.")
    return key


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
    detected_mime = mime_type or mimetypes.guess_type(file_name)[0] or "image/png"
    return types.Part.from_bytes(data=image_bytes, mime_type=detected_mime)


def classify_question(client, question_text: str, image_bytes: bytes | None, mime_type: str | None, file_name: str) -> dict:
    topics_json = load_text(TOPICS_PATH)
    prompt = load_text(TOPIC_PROMPT_PATH).replace("{TOPICS_JSON}", topics_json)
    contents = [prompt]

    if image_bytes:
        contents.append(image_part(image_bytes, mime_type, file_name))
    if question_text.strip():
        contents.append("Student question:\n" + question_text.strip())

    response = client.models.generate_content(model=MODEL_NAME, contents=contents)
    return clean_json_response(response_text(response))


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

    index = load_json(index_path)
    groups = index.get("groups", {})
    cards = []
    image_paths = []
    seen_cards = set()

    for subsubject in selected_subsubjects(classified_topics):
        group = groups.get(subsubject)
        if not group:
            continue

        for card_file in group.get("json_files", [])[:MAX_CARDS_PER_SUBSUBJECT]:
            if card_file in seen_cards:
                continue
            seen_cards.add(card_file)
            card_path = resolve_rag_path(card_file)
            if card_path.exists():
                card = load_json(card_path)
                if card.get("card_id"):
                    cards.append(card)

        for image_file in group.get("image_files", []):
            if image_file and image_file not in image_paths:
                image_paths.append(image_file)

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

    return "\n\n---\n\n".join(parts), used_sources


def solve_with_sources(
    client,
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

    if INCLUDE_SOURCE_IMAGES:
        for image_path_text in image_paths:
            source_path = resolve_rag_path(image_path_text)
            if source_path.exists():
                contents.append(image_part(source_path.read_bytes(), None, source_path.name))

    response = client.models.generate_content(model=MODEL_NAME, contents=contents)
    return response_text(response), used_sources


def solve_student_question(question_text: str, uploaded_file=None) -> dict:
    image_bytes = None
    mime_type = None
    file_name = ""

    if uploaded_file:
        image_bytes = uploaded_file.read()
        mime_type = getattr(uploaded_file, "content_type", None)
        file_name = getattr(uploaded_file, "name", "")

    if not question_text.strip() and not image_bytes:
        raise ValueError("Question text or image is required.")

    client = genai.Client(api_key=api_key())
    classified_topics = classify_question(client, question_text, image_bytes, mime_type, file_name)
    cards, image_paths = load_relevant_cards(classified_topics)
    answer, sources = solve_with_sources(
        client,
        question_text,
        image_bytes,
        mime_type,
        file_name,
        classified_topics,
        cards,
        image_paths,
    )

    return {
        "reply": answer,
        "classified_topics": classified_topics,
        "sources": sources,
        "source_count": len(sources),
    }
