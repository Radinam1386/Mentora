import os


def generate(prompt):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")

    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)
    model = os.getenv("GEMINI_MODEL", "gemma-4-31b-it")
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        ),
    ]

    full_response = ""
    for chunk in client.models.generate_content_stream(model=model, contents=contents):
        if chunk.text:
            full_response += chunk.text

    return full_response
