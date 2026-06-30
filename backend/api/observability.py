import hashlib
import os
from datetime import timedelta

from django.db.utils import OperationalError, ProgrammingError
from django.utils import timezone

from .models import ApiUsageLog, AppEventLog


LOG_RETENTION_DAYS = int(os.environ.get("ADMIN_LOG_RETENTION_DAYS", "90") or "90")


def key_fingerprint(key: str) -> str:
    if not key:
        return "missing"
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return digest[:12]


def safe_error_message(error, max_length=700) -> str:
    text = str(error or "").replace("\n", " ").strip()
    for secret_name in (
        "MODEL_API",
        "GOOGLE_API_KEY",
        "GEMINI_API_KEY",
        "RAG_GOOGLE_API_KEY",
        "RAG_API_KEYS",
    ):
        secret = os.environ.get(secret_name, "")
        if secret and secret in text:
            text = text.replace(secret, "[redacted]")
    return text[:max_length]


def _safe_create(model_cls, **fields):
    try:
        return model_cls.objects.create(**fields)
    except (OperationalError, ProgrammingError):
        return None
    except Exception:
        return None


def log_api_usage(
    *,
    provider,
    sdk,
    model,
    operation,
    key="",
    status="success",
    latency_ms=0,
    retry_count=0,
    token_usage=None,
    response_id="",
    finish_reason="",
    error=None,
    http_status=None,
    metadata=None,
    user=None,
):
    token_usage = token_usage or {}
    log = _safe_create(
        ApiUsageLog,
        user=user,
        provider=provider,
        sdk=sdk,
        model=model or "",
        operation=operation,
        key_fingerprint=key_fingerprint(key),
        status=status,
        latency_ms=max(0, int(latency_ms or 0)),
        retry_count=max(0, int(retry_count or 0)),
        prompt_tokens=int(token_usage.get("prompt_tokens") or 0),
        completion_tokens=int(token_usage.get("completion_tokens") or 0),
        total_tokens=int(token_usage.get("total_tokens") or 0),
        response_id=str(response_id or "")[:180],
        finish_reason=str(finish_reason or "")[:100],
        error_type=error.__class__.__name__[:120] if error else "",
        error_message=safe_error_message(error) if error else "",
        http_status=http_status,
        metadata=metadata or {},
    )
    if error:
        log_app_event(
            level="error",
            source="model_provider",
            event_type=f"{provider}.{operation}.failed",
            message=safe_error_message(error),
            user=user,
            metadata={
                "provider": provider,
                "sdk": sdk,
                "model": model,
                "keyFingerprint": key_fingerprint(key),
                "httpStatus": http_status,
            },
        )
    return log


def log_app_event(level, source, event_type, message="", user=None, metadata=None):
    return _safe_create(
        AppEventLog,
        level=level,
        source=source,
        event_type=event_type,
        message=safe_error_message(message, max_length=1000),
        user=user,
        metadata=metadata or {},
    )


def extract_google_usage(response) -> dict:
    usage = getattr(response, "usage_metadata", None)
    if not usage:
        return {}
    return {
        "prompt_tokens": getattr(usage, "prompt_token_count", 0) or 0,
        "completion_tokens": getattr(usage, "candidates_token_count", 0) or 0,
        "total_tokens": getattr(usage, "total_token_count", 0) or 0,
    }


def extract_google_response_id(response) -> str:
    return getattr(response, "response_id", "") or ""


def extract_google_finish_reason(response) -> str:
    for candidate in getattr(response, "candidates", []) or []:
        finish_reason = getattr(candidate, "finish_reason", "")
        if finish_reason:
            return str(finish_reason).split(".")[-1]
    return ""


def extract_openai_usage(response) -> dict:
    usage = getattr(response, "usage", None)
    if not usage:
        return {}
    return {
        "prompt_tokens": getattr(usage, "prompt_tokens", 0) or 0,
        "completion_tokens": getattr(usage, "completion_tokens", 0) or 0,
        "total_tokens": getattr(usage, "total_tokens", 0) or 0,
    }


def prune_observability_logs():
    cutoff = timezone.now() - timedelta(days=LOG_RETENTION_DAYS)
    try:
        ApiUsageLog.objects.filter(created_at__lt=cutoff).delete()
        AppEventLog.objects.filter(created_at__lt=cutoff).delete()
    except (OperationalError, ProgrammingError):
        return
