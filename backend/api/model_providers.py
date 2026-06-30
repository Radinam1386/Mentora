import os
import random
import re
import time

from .observability import (
    extract_google_finish_reason,
    extract_google_response_id,
    extract_google_usage,
    extract_openai_usage,
    log_api_usage,
)

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


class ModelProviderConfigError(Exception):
    pass


def env_int(name: str, default: int, minimum: int = 0) -> int:
    try:
        return max(minimum, int(os.environ.get(name, str(default))))
    except ValueError:
        return default


def split_api_keys(value: str) -> list[str]:
    return [part.strip() for part in re.split(r"[\s,;]+", value or "") if part.strip()]


def google_api_keys() -> list[str]:
    if genai is None or types is None:
        raise ModelProviderConfigError("google-genai is not installed. Run: pip install -r backend/requirements.txt")

    keys = []
    for env_name in (
        "RAG_API_KEYS",
        "RAG_GOOGLE_API_KEYS",
        "GOOGLE_API_KEYS",
        "GEMINI_API_KEYS",
        "RAG_GOOGLE_API_KEY",
        "GOOGLE_API_KEY",
        "GEMINI_API_KEY",
    ):
        keys.extend(split_api_keys(os.environ.get(env_name, "")))
    unique_keys = list(dict.fromkeys(keys))
    if not unique_keys:
        raise ModelProviderConfigError(
            "Google API key is missing. Set RAG_GOOGLE_API_KEYS, GOOGLE_API_KEY, GEMINI_API_KEY, or RAG_GOOGLE_API_KEY."
        )
    return unique_keys


def google_client(api_key: str, base_url="", api_version=""):
    http_options = {}
    if base_url:
        http_options["base_url"] = base_url
    if api_version:
        http_options["api_version"] = api_version
    if http_options:
        return genai.Client(api_key=api_key, http_options=types.HttpOptions(**http_options))
    return genai.Client(api_key=api_key)


def generate_google_content(
    *,
    operation,
    model,
    contents,
    base_url="",
    api_version="",
    max_retries=0,
    user=None,
    metadata=None,
):
    try:
        keys = google_api_keys()
    except ModelProviderConfigError as exc:
        log_api_usage(
            provider="google",
            sdk="google-genai",
            model=model,
            operation=operation,
            key="",
            status="error",
            error=exc,
            metadata=metadata or {},
            user=user,
        )
        raise
    random.shuffle(keys)
    last_error = None

    for attempt in range(1, max_retries + 2):
        key = keys[(attempt - 1) % len(keys)]
        started_at = time.perf_counter()
        try:
            client = google_client(key, base_url=base_url, api_version=api_version)
            response = client.models.generate_content(
                model=model,
                contents=contents,
            )
            elapsed_ms = round((time.perf_counter() - started_at) * 1000)
            log_api_usage(
                provider="google",
                sdk="google-genai",
                model=model,
                operation=operation,
                key=key,
                status="success",
                latency_ms=elapsed_ms,
                retry_count=attempt - 1,
                token_usage=extract_google_usage(response),
                response_id=extract_google_response_id(response),
                finish_reason=extract_google_finish_reason(response),
                metadata=metadata or {},
                user=user,
            )
            return response
        except ModelProviderConfigError:
            raise
        except Exception as exc:
            last_error = exc
            elapsed_ms = round((time.perf_counter() - started_at) * 1000)
            log_api_usage(
                provider="google",
                sdk="google-genai",
                model=model,
                operation=operation,
                key=key,
                status="error",
                latency_ms=elapsed_ms,
                retry_count=attempt - 1,
                error=exc,
                http_status=getattr(exc, "status_code", None),
                metadata=metadata or {},
                user=user,
            )
            if attempt <= max_retries:
                continue
            raise last_error


def generate_openai_chat(
    *,
    operation,
    prompt,
    api_key=None,
    base_url=None,
    model=None,
    user=None,
    metadata=None,
):
    if OpenAI is None:
        raise ModelProviderConfigError("openai is not installed. Run: pip install -r backend/requirements.txt")

    selected_key = api_key or os.environ.get("MODEL_API", "")
    selected_model = model or os.environ.get("MODEL_NAME", "x-ai/grok-4.3")
    selected_base_url = base_url or os.environ.get("MODEL_BASE_URL", "https://api.hormouz.net/v1")
    if not selected_key:
        exc = ModelProviderConfigError("MODEL_API environment variable not set")
        log_api_usage(
            provider="openai-compatible",
            sdk="openai",
            model=selected_model,
            operation=operation,
            key="",
            status="error",
            error=exc,
            metadata={"baseUrl": selected_base_url, **(metadata or {})},
            user=user,
        )
        raise exc

    started_at = time.perf_counter()
    try:
        client = OpenAI(api_key=selected_key, base_url=selected_base_url)
        response = client.chat.completions.create(
            model=selected_model,
            messages=[{"role": "user", "content": prompt}],
        )
        elapsed_ms = round((time.perf_counter() - started_at) * 1000)
        choice = response.choices[0] if getattr(response, "choices", None) else None
        log_api_usage(
            provider="openai-compatible",
            sdk="openai",
            model=selected_model,
            operation=operation,
            key=selected_key,
            status="success",
            latency_ms=elapsed_ms,
            token_usage=extract_openai_usage(response),
            response_id=getattr(response, "id", "") or "",
            finish_reason=getattr(choice, "finish_reason", "") if choice else "",
            metadata={"baseUrl": selected_base_url, **(metadata or {})},
            user=user,
        )
        return response.choices[0].message.content if choice else ""
    except ModelProviderConfigError:
        raise
    except Exception as exc:
        elapsed_ms = round((time.perf_counter() - started_at) * 1000)
        log_api_usage(
            provider="openai-compatible",
            sdk="openai",
            model=selected_model,
            operation=operation,
            key=selected_key,
            status="error",
            latency_ms=elapsed_ms,
            error=exc,
            http_status=getattr(exc, "status_code", None),
            metadata={"baseUrl": selected_base_url, **(metadata or {})},
            user=user,
        )
        raise


def provider_statuses():
    google_keys = []
    for env_name in (
        "RAG_API_KEYS",
        "RAG_GOOGLE_API_KEYS",
        "GOOGLE_API_KEYS",
        "GEMINI_API_KEYS",
        "RAG_GOOGLE_API_KEY",
        "GOOGLE_API_KEY",
        "GEMINI_API_KEY",
    ):
        google_keys.extend(split_api_keys(os.environ.get(env_name, "")))

    return [
        {
            "key": "rag_google",
            "label": "Tutor / RAG Gemini",
            "provider": "google",
            "sdk": "google-genai",
            "model": os.environ.get("RAG_MODEL_NAME", "gemma-4-31b-it"),
            "baseUrl": os.environ.get("RAG_GOOGLE_BASE_URL", "") or "default",
            "apiVersion": os.environ.get("RAG_GOOGLE_API_VERSION", "") or "default",
            "keyCount": len(list(dict.fromkeys(google_keys))),
            "configured": bool(google_keys),
        },
        {
            "key": "planner_hormuz",
            "label": "Planning Assistant Hormuz",
            "provider": "openai-compatible",
            "sdk": "openai",
            "model": os.environ.get("MODEL_NAME", "x-ai/grok-4.3"),
            "baseUrl": os.environ.get("MODEL_BASE_URL", "https://api.hormouz.net/v1"),
            "apiVersion": "chat.completions",
            "keyCount": 1 if os.environ.get("MODEL_API") else 0,
            "configured": bool(os.environ.get("MODEL_API")),
        },
    ]
