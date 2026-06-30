from dotenv import load_dotenv
from pathlib import Path
import sys


load_dotenv()

# def generate(prompt):
#     api_key = os.environ.get("GEMINI_API_KEY")
#     if not api_key:
#         raise ValueError("GEMINI_API_KEY environment variable not set")

#     from google import genai
#     from google.genai import types

#     client = genai.Client(api_key=api_key)
#     model = os.getenv("GEMINI_MODEL", "gemma-4-31b-it")
#     contents = [
#         types.Content(
#             role="user",
#             parts=[types.Part.from_text(text=prompt)],
#         ),
#     ]

#     full_response = ""
#     for chunk in client.models.generate_content_stream(model=model, contents=contents):
#         if chunk.text:
#             full_response += chunk.text

#     return full_response


try:
    from api.model_providers import generate_openai_chat
except ModuleNotFoundError:
    BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    from api.model_providers import generate_openai_chat


def generate(prompt):
    return generate_openai_chat(
        operation="weekly_planning",
        prompt=prompt,
        metadata={"module": "Planning-Assistant"},
    )
