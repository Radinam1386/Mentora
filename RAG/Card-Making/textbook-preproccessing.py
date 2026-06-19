from pathlib import Path
import json
import mimetypes
import os
import re
import time

from google import genai
from google.genai import types


# ================= SETTINGS =================
API_KEY = os.environ.get("GOOGLE_API_KEY", "YOUR_GOOGLE_AI_STUDIO_API_KEY")
MODEL_NAME = "gemini-3.5-flash"

INPUT_FOLDER = r"D:\ALI\Programming-AI\Mentora\RAG\Books\Chemistry1Textbook1"
BATCH_SIZE = 50
DELAY_SECONDS = 1
MIN_CONFIDENCE = 0.0

OUTPUT_JSON_NAME = "valid-pages.json"
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
# ============================================


VALID_TYPES = {"lesson", "lesson_answer_mixed"}


def page_number_from_filename(path: Path) -> int:
    """
    Uses the PDF page number from the filename.
    Examples:
      page_001.png -> 1
      textbook-p042.jpg -> 42
      scan_17.png -> 17
    """
    match = re.search(r"(?:page|p)[_\-\s]*(\d+)", path.stem, re.IGNORECASE)
    if match:
        return int(match.group(1))

    numbers = re.findall(r"\d+", path.stem)
    if numbers:
        return int(numbers[-1])

    raise ValueError(f"Could not find a page number in filename: {path.name}")


def get_page_images(folder: Path) -> list[dict]:
    images = [
        path
        for path in folder.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    ]

    pages = [{"page": page_number_from_filename(path), "path": path} for path in images]
    pages.sort(key=lambda item: item["page"])

    seen_pages = set()
    for item in pages:
        if item["page"] in seen_pages:
            raise ValueError(f"Duplicate PDF page number found: {item['page']}")
        seen_pages.add(item["page"])

    return pages


def chunk_list(items: list, chunk_size: int) -> list[list]:
    return [items[i : i + chunk_size] for i in range(0, len(items), chunk_size)]


def image_to_part(path: Path):
    mime_type = mimetypes.guess_type(path)[0] or "image/png"
    return types.Part.from_bytes(data=path.read_bytes(), mime_type=mime_type)


def make_prompt(batch: list[dict]) -> str:
    pdf_pages = [item["page"] for item in batch]

    return f"""
You are classifying scanned textbook PDF pages.

I will send {len(batch)} images after this prompt.
They are in exactly this order:
{json.dumps(pdf_pages)}

For each image, classify the matching PDF page number into exactly one type:
- lesson: mostly real teaching material, not answer-key explanations.
- question: mostly exercises, tests, numbered questions, or multiple-choice items.
- answer: mostly answer key, final answers, worked solutions, formulas used to solve questions, or "گزینه" solution blocks.
- lesson_answer_mixed: an answer/solution page that also contains a real lesson/note section.
- unclear: not enough evidence.

Very important visual rule for this book:
- Real lesson/note sections are usually inside a large orange dashed rounded rectangle.
- They often have a STOP face/icon and a title like "ایستگاه درس و نکته".
- If a page has this orange dashed lesson box, classify it as lesson_answer_mixed if there are also answers/solutions on the page.
- If a page is only worked answers/solutions, classify it as answer, even if it explains formulas or has tables.
- Orange tables, orange headings, or normal orange lines do NOT make a page a lesson. The strong cue is the orange dashed lesson box around a teaching section.
- Pages like PDF 86 and 87 in this book are answer pages, not lessons: they contain "گزینه" headings, calculations, and solution text, but no orange dashed lesson box.

Important:
- Use the PDF page numbers from the list above, not any printed page number inside the scan.
- Valid pages for card-making are only: lesson and lesson_answer_mixed.
- Return JSON only.

Required JSON format:
{{
  "pages": [
    {{"page": 1, "type": "lesson", "confidence": 0.94}},
    {{"page": 2, "type": "question", "confidence": 0.88}}
  ]
}}
""".strip()


def get_response_text(response) -> str:
    if response.text:
        return response.text

    texts = []
    for candidate in getattr(response, "candidates", []) or []:
        content = getattr(candidate, "content", None)
        for part in getattr(content, "parts", []) or []:
            if getattr(part, "text", None):
                texts.append(part.text)

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


def classify_batch(client: genai.Client, batch: list[dict]) -> list[int]:
    contents = [make_prompt(batch)]
    contents.extend(image_to_part(item["path"]) for item in batch)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=contents,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    result = clean_json_response(get_response_text(response))
    valid_pages = []
    expected_pages = {item["page"] for item in batch}

    for item in result.get("pages", []):
        page = int(item.get("page", -1))
        page_type = str(item.get("type", "unclear")).strip().lower()
        confidence = float(item.get("confidence", 0))

        if page not in expected_pages:
            continue

        if page_type in VALID_TYPES and confidence >= MIN_CONFIDENCE:
            valid_pages.append(page)

    return valid_pages


def save_valid_pages(output_path: Path, valid_pages: list[int]) -> None:
    output = {"valid-pages": sorted(set(valid_pages))}
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    if not API_KEY or API_KEY == "PASTE_YOUR_GOOGLE_API_KEY_HERE":
        raise ValueError("Set GOOGLE_API_KEY or paste your key into API_KEY.")

    input_folder = Path(INPUT_FOLDER)
    output_path = input_folder / OUTPUT_JSON_NAME

    pages = get_page_images(input_folder)
    batches = chunk_list(pages, BATCH_SIZE)
    client = genai.Client(api_key=API_KEY)

    all_valid_pages = []

    print(f"Images: {len(pages)}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"API calls: {len(batches)}")
    print(f"Output: {output_path}")

    for index, batch in enumerate(batches, start=1):
        page_numbers = [item["page"] for item in batch]
        print(f"\nBatch {index}/{len(batches)}: pages {page_numbers[0]} to {page_numbers[-1]}")

        valid_pages = classify_batch(client, batch)
        all_valid_pages.extend(valid_pages)
        save_valid_pages(output_path, all_valid_pages)

        print(f"Valid pages from this batch: {valid_pages}")
        time.sleep(DELAY_SECONDS)

    print(f"\nDone. Saved {len(set(all_valid_pages))} valid pages to: {output_path}")


main()
