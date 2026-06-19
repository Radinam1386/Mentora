from pathlib import Path
import json
import os
import re
import subprocess
import time

from google import genai
from google.genai import types


def env_text(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def env_int(name: str, default: int) -> int:
    value = env_text(name)
    return int(value) if value else default


def env_float(name: str, default: float) -> float:
    value = env_text(name)
    return float(value) if value else default


def env_bool(name: str, default: bool = False) -> bool:
    value = env_text(name).lower()
    if not value:
        return default
    return value in ["1", "true", "yes", "y", "on"]


def env_pages(name: str) -> list[str]:
    value = env_text(name)
    if not value:
        return []

    pages = []
    for item in re.split(r"[\s,]+", value):
        item = item.strip()
        if not item:
            continue
        if item.isdigit():
            pages.append(f"page_{int(item):03d}.png")
        else:
            pages.append(item)
    return pages


# ====== GITHUB ACTION SETTINGS ======
API_KEY = env_text("GOOGLE_API_KEY")
MODEL_NAME = env_text("RAG_MODEL_NAME", "gemma-4-31b-it")

BOOK_CODE = env_text("RAG_BOOK_CODE", "Calculus2SchoolBook")
MAIN_SUBJECT = env_text("RAG_MAIN_SUBJECT", "math")
GRADE = env_text("RAG_GRADE", "12")
PROMPT_FILE = env_text("RAG_PROMPT_FILE", "Card-Maker-Math-Prompt.txt")

START_PAGE = env_int("RAG_START_PAGE", 1)
END_PAGE = env_int("RAG_END_PAGE", 9999)
FAILED_PAGES = env_pages("RAG_FAILED_PAGES")

OVERWRITE = env_bool("RAG_OVERWRITE", False)
DELAY_SECONDS = env_float("RAG_DELAY_SECONDS", 1)
PREVIOUS_CARDS_PAGES = env_int("RAG_PREVIOUS_CARDS_PAGES", 2)
MAX_RETRIES = env_int("RAG_MAX_RETRIES", 2)
COMMIT_EACH_RESULT = env_bool("RAG_COMMIT_EACH_RESULT", False)
# ====================================


CARD_MAKING_DIR = Path(__file__).resolve().parent
RAG_DIR = CARD_MAKING_DIR.parent
REPO_DIR = RAG_DIR.parent
PROMPT_PATH = CARD_MAKING_DIR / PROMPT_FILE
TOPICS_PATH = RAG_DIR / "Topics" / f"{MAIN_SUBJECT}-topics.json"
BOOK_IMAGES_DIR = RAG_DIR / "Books" / BOOK_CODE
CARDS_OUTPUT_DIR = RAG_DIR / "Cards" / BOOK_CODE

failed_pages = []


def commit_and_push(path: Path, message: str) -> None:
    if not COMMIT_EACH_RESULT:
        return

    relative_path = path.resolve().relative_to(REPO_DIR.resolve()).as_posix()

    subprocess.run(["git", "add", relative_path], cwd=REPO_DIR, check=True)
    diff_result = subprocess.run(
        ["git", "diff", "--cached", "--quiet", "--", relative_path],
        cwd=REPO_DIR,
    )

    if diff_result.returncode == 0:
        print(f"no git changes for: {relative_path}")
        return

    subprocess.run(["git", "commit", "-m", message], cwd=REPO_DIR, check=True)
    subprocess.run(["git", "push"], cwd=REPO_DIR, check=True)
    print(f"committed and pushed: {relative_path}")


def page_number_from_image(image_path: Path) -> int:
    match = re.search(r"page_(\d+)\.png$", image_path.name)
    if not match:
        raise ValueError(f"Image name must look like page_009.png: {image_path.name}")
    return int(match.group(1))


def load_allowed_subsubjects() -> list[str]:
    topics = json.loads(TOPICS_PATH.read_text(encoding="utf-8"))
    subsubjects = topics["subsubjects"]

    if "general" not in subsubjects:
        subsubjects = ["general", *subsubjects]

    return subsubjects


def load_previous_cards_context(page_number: int) -> str:
    if PREVIOUS_CARDS_PAGES <= 0:
        return "No previous cards were provided."

    previous_cards = []
    start_page = max(1, page_number - PREVIOUS_CARDS_PAGES)

    for previous_page in range(start_page, page_number):
        pattern = f"*_p{previous_page:03d}_c*.json"
        for card_path in sorted(CARDS_OUTPUT_DIR.glob(pattern)):
            card = json.loads(card_path.read_text(encoding="utf-8"))
            previous_cards.append(json.dumps(card, ensure_ascii=False, indent=2))

    if not previous_cards:
        return "No previous cards were found."

    return "\n\n---\n\n".join(previous_cards)


def make_prompt(page_number: int, allowed_subsubjects: list[str]) -> str:
    template = PROMPT_PATH.read_text(encoding="utf-8")
    page_number_3digits = f"{page_number:03d}"
    allowed_subsubjects_json = json.dumps(allowed_subsubjects, ensure_ascii=False)
    previous_cards_context = load_previous_cards_context(page_number)

    return (
        template.replace("{ALLOWED_SUBSUBJECTS}", allowed_subsubjects_json)
        .replace("{PREVIOUS_CARDS_CONTEXT}", previous_cards_context)
        .replace("{MAIN_SUBJECT}", MAIN_SUBJECT)
        .replace("{GRADE}", GRADE)
        .replace("{BOOK_CODE}", BOOK_CODE)
        .replace("{PAGE_NUMBER_3DIGITS}", page_number_3digits)
        .replace("{PAGE_NUMBER}", str(page_number))
    )


def get_response_text(response) -> str:
    if response.text:
        return response.text

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


def normalize_cards(cards: list[dict], page_number: int, allowed_subsubjects: list[str]) -> list[dict]:
    normalized = []
    page_number_3digits = f"{page_number:03d}"

    for index, card in enumerate(cards, start=1):
        card_number_2digits = f"{index:02d}"
        subsubject = card.get("subsubject", "general")

        if subsubject not in allowed_subsubjects:
            subsubject = "general"

        card["card_id"] = (
            f"{MAIN_SUBJECT}_{GRADE}_{BOOK_CODE}_p{page_number_3digits}_c{card_number_2digits}"
        )
        card["main_subject"] = MAIN_SUBJECT
        card["subsubject"] = subsubject
        card["tag"] = f"{MAIN_SUBJECT}/{subsubject}"
        card["source_page"] = page_number
        card["image_path"] = f"Books/{BOOK_CODE}/page_{page_number_3digits}.png"

        try:
            card["confidence"] = float(card.get("confidence", 0))
        except (TypeError, ValueError):
            card["confidence"] = 0

        normalized.append(card)

    return normalized


def save_cards(cards: list[dict], page_number: int, empty_result: dict | None = None) -> None:
    CARDS_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    page_number_3digits = f"{page_number:03d}"

    if not cards:
        page_result = dict(empty_result or {})
        page_result["cards"] = []
        page_result.setdefault("page_status", "no_extract_worthy_content")
        page_result.setdefault("reason", "No extract-worthy content was found.")
        page_result["source_page"] = page_number
        page_result["image_path"] = f"Books/{BOOK_CODE}/page_{page_number_3digits}.png"
        page_result.setdefault("confidence", 0)

        output_path = CARDS_OUTPUT_DIR / (
            f"{MAIN_SUBJECT}_{GRADE}_{BOOK_CODE}_p{page_number_3digits}_c01.json"
        )
        if output_path.exists() and not OVERWRITE:
            print(f"skipped existing: {output_path}")
            return

        output_path.write_text(
            json.dumps(page_result, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"saved empty page result: {output_path}")
        commit_and_push(output_path, f"Add RAG page result {output_path.stem}")
        return

    for card in cards:
        output_path = CARDS_OUTPUT_DIR / f"{card['card_id']}.json"

        if output_path.exists() and not OVERWRITE:
            print(f"skipped existing: {output_path}")
            continue

        output_path.write_text(
            json.dumps(card, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"saved card: {output_path}")
        commit_and_push(output_path, f"Add RAG card {card['card_id']}")


def make_cards_for_image(client: genai.Client, image_path: Path, allowed_subsubjects: list[str]) -> None:
    page_number = page_number_from_image(image_path)
    prompt = make_prompt(page_number, allowed_subsubjects)

    image_part = types.Part.from_bytes(
        data=image_path.read_bytes(),
        mime_type="image/png",
    )

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[image_part, prompt],
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    result = clean_json_response(get_response_text(response))
    raw_cards = result.get("cards", [])
    cards = normalize_cards(raw_cards, page_number, allowed_subsubjects)
    save_cards(cards, page_number, result)


def pick_page_images() -> list[Path]:
    page_images = sorted(BOOK_IMAGES_DIR.glob("page_*.png"))

    if FAILED_PAGES:
        return [image for image in page_images if image.name in FAILED_PAGES]

    return [
        image
        for image in page_images
        if START_PAGE <= page_number_from_image(image) <= END_PAGE
    ]


def write_failed_pages() -> None:
    if not failed_pages:
        return

    CARDS_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    failed_path = CARDS_OUTPUT_DIR / "_failed_pages.json"
    failed_path.write_text(
        json.dumps(failed_pages, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"saved failed pages list: {failed_path}")
    commit_and_push(failed_path, f"Update failed RAG pages for {BOOK_CODE}")


def main() -> None:
    if not API_KEY:
        raise ValueError("Missing GOOGLE_API_KEY. Add it as a GitHub Actions secret.")

    if not PROMPT_PATH.exists():
        raise FileNotFoundError(f"Prompt file not found: {PROMPT_PATH}")

    if not TOPICS_PATH.exists():
        raise FileNotFoundError(f"Topics file not found: {TOPICS_PATH}")

    if not BOOK_IMAGES_DIR.exists():
        raise FileNotFoundError(f"Book images folder not found: {BOOK_IMAGES_DIR}")

    allowed_subsubjects = load_allowed_subsubjects()
    page_images = pick_page_images()

    if not page_images:
        raise ValueError("No page images matched the selected pages.")

    client = genai.Client(api_key=API_KEY)

    print(f"Book: {BOOK_CODE}")
    print(f"Subject: {MAIN_SUBJECT}")
    print(f"Grade: {GRADE}")
    print(f"Prompt: {PROMPT_PATH}")
    print(f"Images: {len(page_images)}")
    print(f"Output: {CARDS_OUTPUT_DIR}")
    print(f"Overwrite: {OVERWRITE}")

    for image_path in page_images:
        print(f"\nprocessing: {image_path.name}")

        for attempt in range(1, MAX_RETRIES + 2):
            try:
                make_cards_for_image(client, image_path, allowed_subsubjects)
                break
            except Exception as error:
                if attempt <= MAX_RETRIES:
                    print(f"retry {attempt}/{MAX_RETRIES} after error: {error}")
                    time.sleep(max(DELAY_SECONDS, 1))
                    continue

                print(f"ERROR on {image_path.name}: {error}")
                failed_pages.append(
                    {
                        "page": page_number_from_image(image_path),
                        "image": str(image_path),
                        "error": str(error),
                    }
                )
                write_failed_pages()

        time.sleep(DELAY_SECONDS)

    write_failed_pages()

    if failed_pages:
        print(f"Finished with {len(failed_pages)} failed page(s).")
    else:
        print("Finished with no failed pages.")


main()
