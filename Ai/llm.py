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
    client = OpenAI(
        api_key = os.environ.get("MODEL_API"),
        base_url = "https://api.hormouz.net/v1"
    )

    response = client.chat.completions.create(
        model="qwen/qwen3.7-max",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content