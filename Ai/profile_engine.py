from __future__ import annotations

from copy import deepcopy
from datetime import datetime
from typing import Any
from uuid import uuid4


DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"]


def now_iso() -> str:
    return datetime.now().replace(microsecond=0).isoformat()


def clamp(value: float, minimum: int, maximum: int) -> int:
    return max(minimum, min(maximum, round(value)))


def make_student_id(name: str) -> str:
    clean = "".join(ch for ch in name.strip().lower().replace(" ", "-") if ch.isalnum() or ch == "-")
    return clean or f"student-{uuid4().hex[:8]}"


def build_profile(
    student: dict[str, Any],
    availability: dict[str, Any],
    course_inputs: dict[str, dict[str, Any]],
    courses_data: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    created_at = now_iso()
    profile = {
        "student_id": student.get("student_id") or make_student_id(student.get("name", "")),
        "created_at": created_at,
        "updated_at": created_at,
        "student": student,
        "availability": availability,
        "courses": {},
        "progress_history": [],
        "planner_state": {
            "version": 1,
            "last_plan_summary": None,
        },
    }

    for course_name, course_data in courses_data.items():
        values = course_inputs.get(course_name, {})
        weakness = int(values.get("student_weakness", 3))
        backlog_hours = float(values.get("backlog_hours", 0))
        profile["courses"][course_name] = {
            "base_difficulty": int(course_data.get("base_difficulty", 3)),
            "topics": course_data.get("topics", []),
            "student_weakness": clamp(weakness, 1, 5),
            "target_importance": clamp(float(values.get("target_importance", 3)), 1, 5),
            "interest": clamp(float(values.get("interest", 3)), 1, 5),
            "last_test_percent": values.get("last_test_percent"),
            "backlog_hours": max(0.0, backlog_hours),
            "weak_topics": values.get("weak_topics", []),
            "notes": values.get("notes", ""),
        }

    return recalculate_profile(profile, courses_data)


def priority_score(course: dict[str, Any]) -> float:
    weakness = float(course.get("student_weakness", 3))
    difficulty = float(course.get("base_difficulty", 3))
    importance = float(course.get("target_importance", 3))
    backlog = min(float(course.get("backlog_hours", 0)), 12)
    interest_penalty = max(0, 3 - float(course.get("interest", 3))) * 0.35
    return round((weakness * 1.45) + (difficulty * 0.9) + (importance * 0.8) + (backlog * 0.22) + interest_penalty, 2)


def recalculate_profile(profile: dict[str, Any], courses_data: dict[str, dict[str, Any]]) -> dict[str, Any]:
    profile = deepcopy(profile)
    weekly_capacity = float(profile.get("availability", {}).get("weekly_hours", 30))
    planning_capacity = max(0, weekly_capacity * 0.9)

    weighted_courses = []
    for course_name, course in profile.get("courses", {}).items():
        base = courses_data.get(course_name, {})
        course["base_difficulty"] = int(course.get("base_difficulty", base.get("base_difficulty", 3)))
        score = priority_score(course)
        course["priority_score"] = score
        weighted_courses.append((course_name, score))

    total_score = sum(score for _, score in weighted_courses) or 1
    for course_name, score in weighted_courses:
        course = profile["courses"][course_name]
        recommended = planning_capacity * (score / total_score)
        minimum = 1.5 if course.get("target_importance", 3) >= 3 else 1.0
        course["recommended_weekly_hours"] = round(max(minimum, recommended) * 2) / 2

    profile["updated_at"] = now_iso()
    return profile


def apply_weekly_progress(
    profile: dict[str, Any],
    progress_report: dict[str, dict[str, Any]],
    courses_data: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    profile = deepcopy(profile)
    week_record = {
        "recorded_at": now_iso(),
        "courses": progress_report,
    }

    for course_name, report in progress_report.items():
        course = profile.get("courses", {}).get(course_name)
        if not course:
            continue

        planned = float(report.get("planned_hours", course.get("recommended_weekly_hours", 0)) or 0)
        studied = float(report.get("studied_hours", 0) or 0)
        quality = float(report.get("quality", 3) or 3)
        test_percent = report.get("test_percent")
        backlog_delta = float(report.get("backlog_delta_hours", 0) or 0)

        course["backlog_hours"] = round(max(0.0, float(course.get("backlog_hours", 0)) + max(0, planned - studied) + backlog_delta), 1)

        completion_ratio = studied / planned if planned > 0 else 1
        should_improve = completion_ratio >= 0.9 and quality >= 4 and (test_percent is None or float(test_percent) >= 60)
        should_worsen = completion_ratio < 0.6 or quality <= 2 or (test_percent is not None and float(test_percent) < 40)

        if should_improve:
            course["student_weakness"] = clamp(float(course.get("student_weakness", 3)) - 1, 1, 5)
        elif should_worsen:
            course["student_weakness"] = clamp(float(course.get("student_weakness", 3)) + 1, 1, 5)

        if test_percent is not None:
            course["last_test_percent"] = float(test_percent)

        course["last_week"] = {
            "planned_hours": planned,
            "studied_hours": studied,
            "completion_ratio": round(completion_ratio, 2),
            "quality": quality,
            "test_percent": test_percent,
            "notes": report.get("notes", ""),
        }

    profile.setdefault("progress_history", []).append(week_record)
    return recalculate_profile(profile, courses_data)


def profile_summary_for_prompt(profile: dict[str, Any]) -> dict[str, Any]:
    summary = deepcopy(profile)
    history = summary.get("progress_history", [])
    summary["progress_history"] = history[-4:]
    return summary
