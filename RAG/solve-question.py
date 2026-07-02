from pathlib import Path
import json
import mimetypes

from google import genai
from google.genai import types


# ====== SETTINGS ======
API_KEY = "YOUR_GOOGLE_AI_STUDIO_API_KEY"
MODEL_NAME = "gemma-4-31b-it"

QUESTION_TEXT = """"""
QUESTION_IMAGE_PATH = "TestQ/RAG-Test12.png"

CLASSIFIED_TOPICS_PATH = "classified-topics.json"
SUBSUBJECT_INDEX_PATH = "physics-subsubject-index.json"

MAX_CARDS_PER_SUBSUBJECT = 200
INCLUDE_SOURCE_IMAGES = True
MAX_SOURCE_IMAGES = 200

OUTPUT_PATH = "solve-question-output.txt"
# ======================


try:
    RAG_DIR = Path(__file__).resolve().parent
except NameError:
    RAG_DIR = Path("/content/Mentora/RAG")
    if not RAG_DIR.exists():
        RAG_DIR = Path.cwd()

PROMPT_PATH = RAG_DIR / "prompts" / "runtime" / "study-solver.txt"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_path(path_text: str) -> Path:
    path = Path(path_text)
    if path.is_absolute():
        return path

    resolved = RAG_DIR / path
    if resolved.exists():
        return resolved

    fixed_path_text = path_text
    fixed_path_text = fixed_path_text.replace("cards/", "Cards/", 1)
    fixed_path_text = fixed_path_text.replace("books/", "Books/", 1)
    return RAG_DIR / fixed_path_text


def selected_subsubjects(classified_topics: dict) -> list[str]:
    subsubjects = classified_topics.get("subsubjects", [])
    selected = []

    for item in subsubjects:
        subsubject = item.get("subsubject")
        if subsubject and subsubject not in selected:
            selected.append(subsubject)

    # Temporary: genetics and cell_biology should always be loaded together.
    # if "genetics" in selected or "cell_biology" in selected:
    #     for subsubject in ["genetics", "cell_biology"]:
    #         if subsubject not in selected:
    #             selected.append(subsubject)

    return selected


def load_relevant_cards(classified_topics: dict, index: dict) -> tuple[list[dict], list[str]]:
    cards = []
    image_paths = []
    groups = index["groups"]

    for subsubject in selected_subsubjects(classified_topics):
        group = groups.get(subsubject)
        if not group:
            continue

        for card_file in group.get("json_files", [])[:MAX_CARDS_PER_SUBSUBJECT]:
            card_path = resolve_path(card_file)
            cards.append(load_json(card_path))

        for image_file in group.get("image_files", []):
            if image_file not in image_paths:
                image_paths.append(image_file)

    return cards, image_paths[:MAX_SOURCE_IMAGES]


def cards_to_text(cards: list[dict]) -> str:
    parts = []

    for card in cards:
        parts.append(
            "\n".join(
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
        )

    return "\n\n---\n\n".join(parts)


def make_prompt(classified_topics: dict, cards: list[dict]) -> str:
    template = PROMPT_PATH.read_text(encoding="utf-8")

    return (
        template.replace(
            "{CLASSIFIED_TOPICS}",
            json.dumps(classified_topics, ensure_ascii=False, indent=2),
        )
        .replace("{SOURCES}", cards_to_text(cards))
        .replace("{QUESTION_TEXT}", QUESTION_TEXT.strip())
    )


def add_image_part(contents: list, image_path_text: str) -> None:
    image_path_text = image_path_text.strip()
    if not image_path_text:
        return

    image_path = Path(image_path_text)
    mime_type = mimetypes.guess_type(image_path)[0] or "image/png"
    contents.append(
        types.Part.from_bytes(
            data=image_path.read_bytes(),
            mime_type=mime_type,
        )
    )


def add_source_images(contents: list, image_paths: list[str]) -> None:
    if not INCLUDE_SOURCE_IMAGES:
        return

    for image_path_text in image_paths:
        image_path = resolve_path(image_path_text)
        mime_type = mimetypes.guess_type(image_path)[0] or "image/png"
        contents.append(
            types.Part.from_bytes(
                data=image_path.read_bytes(),
                mime_type=mime_type,
            )
        )


def solve_question() -> str:
    classified_topics = load_json(resolve_path(CLASSIFIED_TOPICS_PATH))
    index = load_json(resolve_path(SUBSUBJECT_INDEX_PATH))
    cards, source_images = load_relevant_cards(classified_topics, index)

    print(f"Selected cards: {len(cards)}")
    print(f"Selected source images: {len(source_images)}")

    prompt = make_prompt(classified_topics, cards)
    contents = [prompt]

    add_image_part(contents, QUESTION_IMAGE_PATH)
    add_source_images(contents, source_images)

    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=contents,
    )

    return response.text or str(response)


answer = solve_question()

output_path = Path(OUTPUT_PATH)
output_path.write_text(answer, encoding="utf-8")

print(answer)
print(f"\nSaved to: {output_path.resolve()}")
