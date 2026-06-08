import json
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
PROFILES_DIR = DATA_DIR / "profiles"


COURSES_DATA = {
    "حسابان": {
        "base_difficulty": 4,
        "weekly_hours_required": 10,
        "topics": ["تابع", "مثلثات", "حد و پیوستگی", "مشتق"],
    },
    "شیمی": {
        "base_difficulty": 3,
        "weekly_hours_required": 6,
        "topics": ["استوکیومتری", "ترمودینامیک", "تعادل", "شیمی آلی"],
    },
    "فیزیک": {
        "base_difficulty": 4,
        "weekly_hours_required": 8,
        "topics": ["حرکت‌شناسی", "دینامیک", "الکتریسیته", "مغناطیس"],
    },
    "گسسته": {
        "base_difficulty": 5,
        "weekly_hours_required": 5,
        "topics": ["گراف", "ترکیبیات", "نظریه اعداد", "احتمال"],
    },
    "هندسه": {
        "base_difficulty": 4,
        "weekly_hours_required": 5,
        "topics": ["بردار", "مقاطع مخروطی", "تبدیلات", "هندسه فضایی"],
    },
}


def ensure_data_dirs() -> None:
    PROFILES_DIR.mkdir(parents=True, exist_ok=True)


def get_courses() -> dict[str, dict[str, Any]]:
    return COURSES_DATA.copy()


def get_courses_summary(courses: dict[str, Any] | None = None) -> str:
    return json.dumps(courses or COURSES_DATA, ensure_ascii=False, indent=2)


def profile_path(student_id: str) -> Path:
    ensure_data_dirs()
    safe_id = "".join(ch for ch in student_id if ch.isalnum() or ch in ("-", "_"))
    if not safe_id:
        raise ValueError("student_id معتبر نیست.")
    return PROFILES_DIR / f"{safe_id}.json"


def save_profile(profile: dict[str, Any]) -> Path:
    ensure_data_dirs()
    path = profile_path(profile["student_id"])
    path.write_text(json.dumps(profile, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def load_profile(student_id: str) -> dict[str, Any]:
    path = profile_path(student_id)
    if not path.exists():
        raise FileNotFoundError(f"پروفایلی با شناسه {student_id} پیدا نشد.")
    return json.loads(path.read_text(encoding="utf-8"))


def list_profiles() -> list[dict[str, str]]:
    ensure_data_dirs()
    profiles = []
    for path in sorted(PROFILES_DIR.glob("*.json")):
        try:
            profile = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        profiles.append(
            {
                "student_id": profile.get("student_id", path.stem),
                "name": profile.get("student", {}).get("name", "بدون نام"),
                "updated_at": profile.get("updated_at", "-"),
            }
        )
    return profiles
