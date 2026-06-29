from pathlib import Path
import json
import re
import time
import os

from google import genai
from google.genai import types
from google.genai.types import HttpOptions
from dotenv import load_dotenv


def load_project_env() -> None:
    candidates = [Path.cwd() / ".env"]
    if "__file__" in globals():
        candidates.append(Path(__file__).resolve().parents[2] / ".env")

    for env_path in candidates:
        if env_path.exists():
            load_dotenv(env_path)
            return


load_project_env()


# ====== SETTINGS ======
API_KEY = os.environ.get("GOOGLE_API_KEY", "AIzaSyCQW5xTX4t14kaoNGyT3-OtZReI5eWtBDs")
MODEL_NAME = "gemma-4-31b-it"
# GOOGLE_BASE_URL = os.environ.get("RAG_GOOGLE_BASE_URL", "").strip()
GOOGLE_BASE_URL = None
# MODEL_NAME = "gemini-2.5-flash"

BOOK_CODE = "Chemistry2SchoolBook"
MAIN_SUBJECT = "chemistry" # physics
GRADE = "11"

START_PAGE = 1
END_PAGE = 1
FAILED_PAGES = ['48', '73', '107', '112', '119', '127']
OVERWRITE = False
DELAY_SECONDS = 1
PREVIOUS_CARDS_PAGES = 2
MAX_RETRIES = 2
failed_pages = []
# ======================


try:
    CARD_MAKING_DIR = Path(__file__).resolve().parent
    RAG_DIR = CARD_MAKING_DIR.parent
except NameError:
    # Colab/Jupyter cells do not have __file__.
    # Change this manually if your Mentora folder is somewhere else.
    RAG_DIR = Path("/content/Mentora/RAG")
    if not RAG_DIR.exists():
        RAG_DIR = Path.cwd() / "RAG"
    CARD_MAKING_DIR = RAG_DIR / "Card-Making"
PROMPT_PATH = CARD_MAKING_DIR / "Card-Maker-Chemistry-Prompt.txt"
TOPICS_PATH = RAG_DIR / "Topics" / f"{MAIN_SUBJECT}-topics.json"
BOOK_IMAGES_DIR = RAG_DIR / "Books" / BOOK_CODE
CARDS_OUTPUT_DIR = RAG_DIR / "Cards" / BOOK_CODE

# PROMPT_PATH = "/content/Mentora/RAG/Card-Making/Card-Maker-Math-Prompt.txt"
# TOPICS_PATH = "/content/Topics/math-topics.json"
# BOOK_IMAGES_DIR = "/content/Mentora/RAG/Books/Calculus2SchoolBook"
# CARDS_OUTPUT_DIR = "/content/Mentora/RAG/Cards/Calculus2SchoolBook"

def page_number_from_image(image_path: Path) -> int:
    match = re.search(r"page_(\d+)\.png$", image_path.name)
    if not match:
        raise ValueError(f"Image name must look like page_009.png: {image_path.name}")
    return int(match.group(1))


def normalize_page_number(value) -> int | None:
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


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

    if not cards:
        page_number_3digits = f"{page_number:03d}"
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
        output_path.write_text(
            json.dumps(page_result, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"saved empty page result: {output_path}")
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


def main() -> None:
    allowed_subsubjects = load_allowed_subsubjects()
    client_options = {"api_key": API_KEY}
    if GOOGLE_BASE_URL:
        client_options["http_options"] = HttpOptions(base_url=GOOGLE_BASE_URL)
    client = genai.Client(**client_options)

    page_images = sorted(BOOK_IMAGES_DIR.glob("page_*.png"))
    if FAILED_PAGES:
        failed_page_numbers = {
            page
            for page in (normalize_page_number(page) for page in FAILED_PAGES)
            if page is not None
        }
        page_images = [
            image
            for image in page_images
            if page_number_from_image(image) in failed_page_numbers
        ]
    else:
        page_images = [
            image
            for image in page_images
            if START_PAGE <= page_number_from_image(image) <= END_PAGE
        ]

    print(f"Book: {BOOK_CODE}")
    print(f"Subject: {MAIN_SUBJECT}")
    print(f"Grade: {GRADE}")
    print(f"Images: {len(page_images)}")
    print(f"Output: {CARDS_OUTPUT_DIR}")

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
              failed_pages.append({
                "page": page_number_from_image(image_path),
                "image": str(image_path),
                "error": str(error)
                })
              if failed_pages:
                  failed_path = CARDS_OUTPUT_DIR / "_failed_pages.json"
                  failed_path.write_text(
                      json.dumps(failed_pages, ensure_ascii=False, indent=2),
                      encoding="utf-8"
                  )
                  print(f"\nSaved failed pages list: {failed_path}")
      time.sleep(DELAY_SECONDS)





main()
