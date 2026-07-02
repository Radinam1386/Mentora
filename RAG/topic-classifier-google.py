from pathlib import Path
import json
import mimetypes
import re

from google import genai
from google.genai import types


# ====== SETTINGS ======
API_KEY = "YOUR_GOOGLE_AI_STUDIO_API_KEY"
MODEL_NAME = "gemma-4-31b-it"

# Use either QUESTION_TEXT or QUESTION_IMAGE_PATH.
# If QUESTION_IMAGE_PATH is not empty, the image will be sent too.
QUESTION_TEXT = """"""
QUESTION_IMAGE_PATH = "TestQ/RAG-Test12.png"

OUTPUT_JSON_PATH = "classified-topics.json"
# ======================



try:
    RAG_DIR = Path(__file__).resolve().parent
except NameError:
    # Colab/Jupyter cells do not have __file__.
    RAG_DIR = Path("/content")
    if not RAG_DIR.exists():
        RAG_DIR = Path.cwd()

PROMPT_PATH = RAG_DIR / "prompts" / "legacy" / "topic-classifier.txt"
TOPICS_PATH = RAG_DIR / "Topics" / "all-topics.json"


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


def make_prompt() -> str:
    prompt = PROMPT_PATH.read_text(encoding="utf-8")
    topics = TOPICS_PATH.read_text(encoding="utf-8")
    return prompt.replace("{TOPICS_JSON}", topics)


def classify_question() -> dict:
    client = genai.Client(api_key=API_KEY)
    prompt = make_prompt()

    contents = [prompt]

    image_path_text = QUESTION_IMAGE_PATH.strip()
    if image_path_text:
        image_path = Path(image_path_text)
        mime_type = mimetypes.guess_type(image_path)[0] or "image/png"
        image_part = types.Part.from_bytes(
            data=image_path.read_bytes(),
            mime_type=mime_type,
        )
        contents.append(image_part)

    if QUESTION_TEXT.strip():
        contents.append("Student question:\n" + QUESTION_TEXT.strip())

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=contents,
    )

    return clean_json_response(get_response_text(response))


result = classify_question()

output_path = Path(OUTPUT_JSON_PATH)
output_path.write_text(
    json.dumps(result, ensure_ascii=False, indent=2),
    encoding="utf-8",
)

print(json.dumps(result, ensure_ascii=False, indent=2))
print(f"\nSaved to: {output_path.resolve()}")
