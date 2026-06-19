from __future__ import annotations

from copy import deepcopy
from datetime import datetime
from typing import Any
from uuid import uuid4


DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"]
DEFAULT_RATING = 3
MAX_BACKLOG_FOR_PRIORITY = 12
PLANNING_CAPACITY_RATIO = 0.9


def now_iso() -> str:
    return datetime.now().replace(microsecond=0).isoformat()


def clamp(value: float, minimum: int, maximum: int) -> int:
    return max(minimum, min(maximum, round(value)))


def make_student_id(name: str) -> str:
    clean = "".join(ch for ch in name.strip().lower().replace(" ", "-") if ch.isalnum() or ch == "-")
    return clean or f"student-{uuid4().hex[:8]}"


def normalized_course_input(course_data: dict[str, Any], values: dict[str, Any]) -> dict[str, Any]:
    return {
        "base_difficulty": int(course_data.get("base_difficulty", DEFAULT_RATING)),
        "student_weakness": clamp(float(values.get("student_weakness", DEFAULT_RATING)), 1, 5),
        "target_importance": clamp(float(values.get("target_importance", DEFAULT_RATING)), 1, 5),
        "interest": clamp(float(values.get("interest", DEFAULT_RATING)), 1, 5),
        "last_test_percent": values.get("last_test_percent"),
        "backlog_hours": max(0.0, float(values.get("backlog_hours", 0))),
        "notes": values.get("notes", ""),
    }


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
        profile["courses"][course_name] = normalized_course_input(course_data, course_inputs.get(course_name, {}))

    return recalculate_profile(profile, courses_data)


def priority_score(course: dict[str, Any]) -> float:
    weakness = float(course.get("student_weakness", DEFAULT_RATING))
    difficulty = float(course.get("base_difficulty", DEFAULT_RATING))
    importance = float(course.get("target_importance", DEFAULT_RATING))
    backlog = min(float(course.get("backlog_hours", 0)), MAX_BACKLOG_FOR_PRIORITY)
    interest_penalty = max(0, DEFAULT_RATING - float(course.get("interest", DEFAULT_RATING))) * 0.35
    return round((weakness * 1.45) + (difficulty * 0.9) + (importance * 0.8) + (backlog * 0.22) + interest_penalty, 2)


def recommended_hours(score: float, total_score: float, planning_capacity: float, course: dict[str, Any]) -> float:
    recommended = planning_capacity * (score / total_score)
    minimum = 1.5 if course.get("target_importance", DEFAULT_RATING) >= DEFAULT_RATING else 1.0
    return round(max(minimum, recommended) * 2) / 2


def recalculate_profile(profile: dict[str, Any], courses_data: dict[str, dict[str, Any]]) -> dict[str, Any]:
    profile = deepcopy(profile)
    weekly_capacity = float(profile.get("availability", {}).get("weekly_hours", 30))
    planning_capacity = max(0, weekly_capacity * PLANNING_CAPACITY_RATIO)

    weighted_courses = []
    for course_name, course in profile.get("courses", {}).items():
        base = courses_data.get(course_name, {})
        course["base_difficulty"] = int(course.get("base_difficulty", base.get("base_difficulty", DEFAULT_RATING)))
        score = priority_score(course)
        course["priority_score"] = score
        weighted_courses.append((course_name, score))

    total_score = sum(score for _, score in weighted_courses) or 1
    for course_name, score in weighted_courses:
        course = profile["courses"][course_name]
        course["recommended_weekly_hours"] = recommended_hours(score, total_score, planning_capacity, course)

    profile["updated_at"] = now_iso()
    return profile


def parse_progress_values(course: dict[str, Any], report: dict[str, Any]) -> dict[str, Any]:
    planned = float(report.get("planned_hours", course.get("recommended_weekly_hours", 0)) or 0)
    studied = float(report.get("studied_hours", 0) or 0)
    return {
        "planned": planned,
        "studied": studied,
        "quality": float(report.get("quality", DEFAULT_RATING) or DEFAULT_RATING),
        "test_percent": report.get("test_percent"),
        "backlog_delta": float(report.get("backlog_delta_hours", 0) or 0),
        "completion_ratio": studied / planned if planned > 0 else 1,
    }


def update_backlog(course: dict[str, Any], values: dict[str, Any]) -> None:
    current_backlog = float(course.get("backlog_hours", 0))
    missed_hours = max(0, values["planned"] - values["studied"])
    course["backlog_hours"] = round(max(0.0, current_backlog + missed_hours + values["backlog_delta"]), 1)


def update_weakness(course: dict[str, Any], values: dict[str, Any]) -> None:
    test_percent = values["test_percent"]
    did_well = values["completion_ratio"] >= 0.9 and values["quality"] >= 4
    did_poorly = values["completion_ratio"] < 0.6 or values["quality"] <= 2

    should_improve = did_well and (test_percent is None or float(test_percent) >= 60)
    should_worsen = did_poorly or (test_percent is not None and float(test_percent) < 40)

    current = float(course.get("student_weakness", DEFAULT_RATING))
    if should_improve:
        course["student_weakness"] = clamp(current - 1, 1, 5)
    elif should_worsen:
        course["student_weakness"] = clamp(current + 1, 1, 5)


def store_last_week(course: dict[str, Any], report: dict[str, Any], values: dict[str, Any]) -> None:
    if values["test_percent"] is not None:
        course["last_test_percent"] = float(values["test_percent"])

    course["last_week"] = {
        "planned_hours": values["planned"],
        "studied_hours": values["studied"],
        "completion_ratio": round(values["completion_ratio"], 2),
        "quality": values["quality"],
        "test_percent": values["test_percent"],
        "notes": report.get("notes", ""),
    }


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

        values = parse_progress_values(course, report)
        update_backlog(course, values)
        update_weakness(course, values)
        store_last_week(course, report, values)

    profile.setdefault("progress_history", []).append(week_record)
    return recalculate_profile(profile, courses_data)


def profile_summary_for_prompt(profile: dict[str, Any]) -> dict[str, Any]:
    summary = deepcopy(profile)
    history = summary.get("progress_history", [])
    summary["progress_history"] = history[-4:]
    for course in summary.get("courses", {}).values():
        course.pop("topics", None)
        course.pop("weak_topics", None)
    return summary
