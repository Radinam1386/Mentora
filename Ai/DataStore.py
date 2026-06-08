import json
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
PROFILES_DIR = DATA_DIR / "profiles"

SUPPORTED_GRADES = ("دهم", "یازدهم", "دوازدهم")
SUPPORTED_MAJORS = ("ریاضی", "تجربی")

MAJOR_ALIASES = {
    "ریاضی": "ریاضی",
    "رياضی": "ریاضی",
    "ریاضی فیزیک": "ریاضی",
    "تجربی": "تجربی",
    "علوم تجربی": "تجربی",
}

GRADE_ALIASES = {
    "10": "دهم",
    "دهم": "دهم",
    "پایه دهم": "دهم",
    "11": "یازدهم",
    "یازدهم": "یازدهم",
    "يازدهم": "یازدهم",
    "پایه یازدهم": "یازدهم",
    "12": "دوازدهم",
    "دوازدهم": "دوازدهم",
    "پایه دوازدهم": "دوازدهم",
}

COURSES_BY_MAJOR = {
    "ریاضی": {
        "حسابان": {"base_difficulty": 4, "weekly_hours_required": 10},
        "فیزیک": {"base_difficulty": 4, "weekly_hours_required": 8},
        "شیمی": {"base_difficulty": 3, "weekly_hours_required": 6},
        "گسسته": {"base_difficulty": 5, "weekly_hours_required": 5},
        "هندسه": {"base_difficulty": 4, "weekly_hours_required": 5},
    },
    "تجربی": {
        "شیمی": {"base_difficulty": 3, "weekly_hours_required": 7},
        "فیزیک": {"base_difficulty": 4, "weekly_hours_required": 6},
        "ریاضی": {"base_difficulty": 4, "weekly_hours_required": 6},
        "زیست": {"base_difficulty": 5, "weekly_hours_required": 10},
    },
}


def ensure_data_dirs() -> None:
    PROFILES_DIR.mkdir(parents=True, exist_ok=True)


def normalize_major(major: str) -> str:
    normalized = MAJOR_ALIASES.get(major.strip())
    if not normalized:
        raise ValueError(f"رشته باید یکی از این موارد باشد: {', '.join(SUPPORTED_MAJORS)}")
    return normalized


def normalize_grade(grade: str) -> str:
    normalized = GRADE_ALIASES.get(grade.strip())
    if not normalized:
        raise ValueError(f"پایه باید یکی از این موارد باشد: {', '.join(SUPPORTED_GRADES)}")
    return normalized


def get_courses(major: str = "ریاضی") -> dict[str, dict[str, Any]]:
    normalized_major = normalize_major(major)
    return {course: data.copy() for course, data in COURSES_BY_MAJOR[normalized_major].items()}


def get_profile_courses(profile: dict[str, Any]) -> dict[str, dict[str, Any]]:
    major = profile.get("student", {}).get("major", "ریاضی")
    return get_courses(major)


def get_courses_summary(courses: dict[str, Any] | None = None) -> str:
    return json.dumps(courses or get_courses(), ensure_ascii=False, indent=2)


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
