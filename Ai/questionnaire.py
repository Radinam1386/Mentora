from __future__ import annotations

from typing import Any

from profile_engine import DAYS, build_profile


def ask_text(label: str, default: str | None = None) -> str:
    suffix = f" [{default}]" if default else ""
    value = input(f"{label}{suffix}: ").strip()
    return value or (default or "")


def ask_int(label: str, default: int, minimum: int | None = None, maximum: int | None = None) -> int:
    while True:
        raw = ask_text(label, str(default))
        try:
            value = int(raw)
        except ValueError:
            print("لطفا عدد صحیح وارد کن.")
            continue
        if minimum is not None and value < minimum:
            print(f"عدد باید حداقل {minimum} باشد.")
            continue
        if maximum is not None and value > maximum:
            print(f"عدد باید حداکثر {maximum} باشد.")
            continue
        return value


def ask_float(label: str, default: float, minimum: float | None = None, maximum: float | None = None) -> float:
    while True:
        raw = ask_text(label, str(default))
        try:
            value = float(raw)
        except ValueError:
            print("لطفا عدد وارد کن.")
            continue
        if minimum is not None and value < minimum:
            print(f"عدد باید حداقل {minimum} باشد.")
            continue
        if maximum is not None and value > maximum:
            print(f"عدد باید حداکثر {maximum} باشد.")
            continue
        return value


def ask_rating(label: str, default: int = 3) -> int:
    return ask_int(f"{label} (1 تا 5)", default, 1, 5)


def ask_csv(label: str) -> list[str]:
    raw = ask_text(label, "")
    return [part.strip() for part in raw.split(",") if part.strip()]


def collect_profile(courses_data: dict[str, dict[str, Any]]) -> dict[str, Any]:
    print("\n--- ساخت پروفایل دانش‌آموز ---")
    name = ask_text("نام دانش‌آموز", "student")
    student = {
        "name": name,
        "grade": ask_text("پایه/سال تحصیلی", "دوازدهم"),
        "major": ask_text("رشته", "ریاضی"),
        "exam_year": ask_text("سال کنکور", "1405"),
        "goal": ask_text("هدف اصلی", "افزایش تراز و جمع‌بندی منظم"),
    }

    print("\n--- زمان آزاد مطالعه ---")
    daily_hours = {}
    for day in DAYS:
        daily_hours[day] = ask_float(f"چند ساعت در {day} می‌تواند مطالعه کند؟", 4, 0, 16)
    weekly_hours = round(sum(daily_hours.values()), 1)
    availability = {
        "daily_hours": daily_hours,
        "weekly_hours": weekly_hours,
        "preferred_session_minutes": ask_int("طول مناسب هر پارت مطالعه به دقیقه", 90, 30, 180),
        "rest_minutes_between_sessions": ask_int("استراحت بین پارت‌ها به دقیقه", 15, 5, 60),
        "constraints": ask_csv("محدودیت‌ها یا زمان‌های ممنوعه، با کاما جدا کن"),
    }

    print("\n--- وضعیت دروس ---")
    print("ضعف: 1 یعنی خیلی خوب، 5 یعنی خیلی ضعیف/نیازمند زمان زیاد.")
    course_inputs = {}
    for course_name in courses_data:
        print(f"\nدرس: {course_name}")
        course_inputs[course_name] = {
            "student_weakness": ask_rating("میزان ضعف", 3),
            "target_importance": ask_rating("اهمیت برای هدف کنکور", 3),
            "interest": ask_rating("علاقه/انگیزه", 3),
            "backlog_hours": ask_float("عقب‌افتادگی فعلی به ساعت", 0, 0, 100),
            "last_test_percent": ask_float("آخرین درصد آزمون", 50, 0, 100),
            "weak_topics": ask_csv("مباحث ضعیف، با کاما جدا کن"),
            "notes": ask_text("نکته خاص درباره این درس", ""),
        }

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
