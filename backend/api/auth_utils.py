from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.response import Response

from .models import User

JWT_ALGORITHM = "HS256"
JWT_EXP_DAYS = 30

VALID_GRADES = {"یازدهم", "دوازدهم"}
VALID_MAJORS = {"ریاضی", "تجربی"}

WEEKDAY_TO_PERSIAN = {
    0: "دوشنبه",
    1: "سه‌شنبه",
    2: "چهارشنبه",
    3: "پنجشنبه",
    4: "جمعه",
    5: "شنبه",
    6: "یکشنبه",
}


def hash_password(raw_password: str) -> str:
    return make_password(raw_password)


def verify_password(raw_password: str, hashed: str) -> bool:
    if not hashed:
        return False
    return check_password(raw_password, hashed)


def generate_token(user) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user.id,
        "iat": now,
        "exp": now + timedelta(days=JWT_EXP_DAYS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str):
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None


def validate_grade(grade: str) -> str | None:
    if not grade:
        return None
    normalized = grade.strip()
    if normalized in VALID_GRADES:
        return normalized
    return None


def validate_major(major: str) -> str | None:
    if not major:
        return None
    normalized = major.strip()
    if normalized in VALID_MAJORS:
        return normalized
    return None


def get_user_from_request(request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:].strip()
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    try:
        return User.objects.get(id=payload.get("user_id"))
    except User.DoesNotExist:
        return None


def require_auth(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "لطفاً ابتدا وارد حساب کاربری خود شوید."}, status=401)
        request.mentora_user = user
        return view_func(request, *args, **kwargs)

    return wrapper
