from __future__ import annotations

from collections.abc import Callable
from typing import Any

from DataStore import SUPPORTED_GRADES, SUPPORTED_MAJORS, get_courses, normalize_grade, normalize_major
from profile_engine import DAYS, build_profile


Number = int | float


def ask_text(label: str, default: str | None = None) -> str:
    suffix = f" [{default}]" if default else ""
    value = input(f"{label}{suffix}: ").strip()
    return value or (default or "")


def ask_number(
    label: str,
    default: Number,
    cast: Callable[[str], Number],
    minimum: Number | None = None,
    maximum: Number | None = None,
) -> Number:
    while True:
        raw = ask_text(label, str(default))
        try:
            value = cast(raw)
        except ValueError:
            print("لطفا عدد معتبر وارد کن.")
            continue

        if minimum is not None and value < minimum:
            print(f"عدد باید حداقل {minimum} باشد.")
            continue
        if maximum is not None and value > maximum:
            print(f"عدد باید حداکثر {maximum} باشد.")
            continue

        return value


def ask_int(label: str, default: int, minimum: int | None = None, maximum: int | None = None) -> int:
    return int(ask_number(label, default, int, minimum, maximum))


def ask_float(label: str, default: float, minimum: float | None = None, maximum: float | None = None) -> float:
    return float(ask_number(label, default, float, minimum, maximum))


def ask_rating(label: str, default: int = 3) -> int:
    return ask_int(f"{label} (1 تا 5)", default, 1, 5)


def ask_csv(label: str) -> list[str]:
    raw = ask_text(label, "")
    return [part.strip() for part in raw.split(",") if part.strip()]


def ask_choice(label: str, options: tuple[str, ...], default: str, normalizer: Callable[[str], str]) -> str:
    options_text = " / ".join(options)
    while True:
        value = ask_text(f"{label} ({options_text})", default)
        try:
            return normalizer(value)
        except ValueError as exc:
            print(exc)


def collect_student_info() -> dict[str, Any]:
    print("\n--- ساخت پروفایل دانش‌آموز ---")
    return {
        "name": ask_text("نام دانش‌آموز", "student"),
        "grade": ask_choice("پایه/سال تحصیلی", SUPPORTED_GRADES, "دوازدهم", normalize_grade),
        "major": ask_choice("رشته", SUPPORTED_MAJORS, "ریاضی", normalize_major),
        "exam_year": ask_text("سال کنکور", "1405"),
        "goal": ask_text("هدف اصلی", "افزایش تراز و جمع‌بندی منظم"),
    }


def collect_availability() -> dict[str, Any]:
    print("\n--- زمان آزاد مطالعه ---")
    daily_hours = {day: ask_float(f"چند ساعت در {day} می‌تواند مطالعه کند؟", 4, 0, 16) for day in DAYS}
    return {
        "daily_hours": daily_hours,
        "weekly_hours": round(sum(daily_hours.values()), 1),
        "preferred_session_minutes": ask_int("طول مناسب هر پارت مطالعه به دقیقه", 90, 30, 180),
        "rest_minutes_between_sessions": ask_int("استراحت بین پارت‌ها به دقیقه", 15, 5, 60),
        "constraints": ask_csv("محدودیت‌ها یا زمان‌های ممنوعه، با کاما جدا کن"),
    }


def collect_course_status(course_name: str) -> dict[str, Any]:
    print(f"\nدرس: {course_name}")
    return {
        "student_weakness": ask_rating("میزان ضعف", 3),
        "target_importance": ask_rating("اهمیت برای هدف کنکور", 3),
        "interest": ask_rating("علاقه/انگیزه", 3),
        "backlog_hours": ask_float("عقب‌افتادگی فعلی به ساعت", 0, 0, 100),
        "last_test_percent": ask_float("آخرین درصد آزمون", 50, 0, 100),
        "notes": ask_text("نکته خاص درباره این درس", ""),
    }


def collect_profile() -> dict[str, Any]:
    student = collect_student_info()
    availability = collect_availability()
    courses_data = get_courses(student["major"])

    print("\n--- وضعیت دروس ---")
    print("ضعف: 1 یعنی خیلی خوب، 5 یعنی خیلی ضعیف/نیازمند زمان زیاد.")
    print(f"دروس رشته {student['major']}: {', '.join(courses_data)}")

    course_inputs = {course_name: collect_course_status(course_name) for course_name in courses_data}
    return build_profile(student, availability, course_inputs, courses_data)


def collect_progress(profile: dict[str, Any]) -> dict[str, dict[str, Any]]:
    print("\n--- ثبت گزارش عملکرد هفتگی ---")
    report = {}
    for course_name, course in profile.get("courses", {}).items():
        print(f"\nدرس: {course_name}")
        planned_default = float(course.get("recommended_weekly_hours", 0))
        report[course_name] = {
            "planned_hours": ask_float("ساعت برنامه‌ریزی‌شده", planned_default, 0, 100),
            "studied_hours": ask_float("ساعت مطالعه‌شده واقعی", planned_default, 0, 100),
            "quality": ask_rating("کیفیت مطالعه این هفته", 3),
            "test_percent": ask_float("درصد/نتیجه آزمون یا تمرین", float(course.get("last_test_percent") or 50), 0, 100),
            "backlog_delta_hours": ask_float("عقب‌افتادگی اضافه‌شده دستی", 0, -100, 100),
            "notes": ask_text("یادداشت کوتاه", ""),
        }
    return report
