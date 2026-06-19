import os
from dotenv import load_dotenv


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


from openai import OpenAI


def generate(prompt):
    api_key = os.environ.get("MODEL_API")
    if not api_key:
        raise ValueError("MODEL_API environment variable not set")

    client = OpenAI(
        api_key=api_key,
        base_url=os.environ.get("MODEL_BASE_URL", "https://api.hormouz.net/v1"),
    )

    response = client.chat.completions.create(
        model=os.environ.get("MODEL_NAME", "x-ai/grok-4.3"),
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content