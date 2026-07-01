import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

from django.conf import settings
from django.db.utils import OperationalError, ProgrammingError
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .auth_utils import (
    VALID_MAJORS,
    generate_token,
    hash_password,
    require_auth,
    validate_grade,
    validate_major,
    verify_password,
    WEEKDAY_TO_PERSIAN,
)
from .question_solver import QuestionSolverConfigError, solve_student_question

from .models import ChatMessage, DailyTask, OTPCode, QuizQuestion, SubscriptionPlan, User, UserSubscription, WeeklyPlan
from .sms import send_otp as sms_send_otp



PLANNING_ASSISTANT_DIR = Path(__file__).resolve().parents[2] / "Planning-Assistant"
if PLANNING_ASSISTANT_DIR.exists() and str(PLANNING_ASSISTANT_DIR) not in sys.path:
    sys.path.insert(0, str(PLANNING_ASSISTANT_DIR))

try:
    from DataStore import get_courses, normalize_grade, normalize_major
    from profile_engine import DAYS, build_profile
    from prompt import build_planning_prompt, next_study_week
except Exception:
    get_courses = normalize_grade = normalize_major = build_profile = build_planning_prompt = next_study_week = None
    DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"]

PERSIAN_MONTHS = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
]
PERSIAN_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
SUBSCRIPTION_ACTIVATION_CODE = os.environ.get(
    "SUBSCRIPTION_ACTIVATION_CODE",
    "mentora-admin-subscription-extending-code",
).strip()
FREE_TRIAL_DAYS = 10
WEEKLY_PLANNING_LIMIT = 10


def env_flag(name, default=False):
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def to_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def to_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def current_local_date():
    return timezone.localdate()


def to_persian_digits(value) -> str:
    return str(value).translate(PERSIAN_DIGITS)


def gregorian_to_jalali(g_year, g_month, g_day):
    g_days_in_month = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    if g_year > 1600:
        j_year = 979
        g_year -= 1600
    else:
        j_year = 0
        g_year -= 621

    g_year2 = g_year + 1 if g_month > 2 else g_year
    days = (
        365 * g_year
        + (g_year2 + 3) // 4
        - (g_year2 + 99) // 100
        + (g_year2 + 399) // 400
        - 80
        + g_day
        + g_days_in_month[g_month - 1]
    )

    j_year += 33 * (days // 12053)
    days %= 12053
    j_year += 4 * (days // 1461)
    days %= 1461

    if days > 365:
        j_year += (days - 1) // 365
        days = (days - 1) % 365

    if days < 186:
        j_month = 1 + days // 31
        j_day = 1 + days % 31
    else:
        j_month = 7 + (days - 186) // 30
        j_day = 1 + (days - 186) % 30

    return j_year, j_month, j_day


def format_persian_date(gregorian_date):
    j_year, j_month, j_day = gregorian_to_jalali(
        gregorian_date.year,
        gregorian_date.month,
        gregorian_date.day,
    )
    return f"{to_persian_digits(j_day)} {PERSIAN_MONTHS[j_month - 1]} {to_persian_digits(j_year)}"


def format_price(price):
    return f"{to_persian_digits(f'{int(price):,}')} تومان"


def parse_duration_hours(duration):
    text = str(duration or "").translate(str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789"))
    if "شناور" in str(duration or ""):
        return 0.5
    match = re.search(r"\d+(?:\.\d+)?", text)
    return float(match.group(0)) if match else 0.0


def active_subscription_for_user(user):
    today = current_local_date()
    return (
        user.subscriptions
        .filter(is_active=True, end_date__gte=today)
        .order_by("-end_date", "-created_at")
        .first()
    )


def subscription_remaining_days(subscription):
    if not subscription or not subscription.is_active:
        return 0
    today = current_local_date()
    if subscription.end_date < today:
        return 0
    return (subscription.end_date - today).days + 1


def serialize_subscription_plan(plan):
    months = max(1, round(plan.duration_days / 30))
    monthly_price = round(plan.price / months)
    return {
        "id": plan.id,
        "name": plan.name,
        "slug": plan.slug,
        "months": months,
        "durationDays": plan.duration_days,
        "price": plan.price,
        "priceLabel": format_price(plan.price),
        "monthlyPrice": monthly_price,
        "monthlyPriceLabel": format_price(monthly_price),
        "highlight": plan.highlight,
    }


def serialize_subscription(subscription):
    if not subscription:
        return {
            "active": False,
            "planName": "بدون اشتراک فعال",
            "totalDays": 0,
            "remainingDays": 0,
            "usedDays": 0,
            "startDate": "",
            "endDate": "",
            "price": 0,
            "priceLabel": "۰ تومان",
        }

    remaining_days = subscription_remaining_days(subscription)
    used_days = max(0, subscription.total_days - remaining_days)
    return {
        "active": remaining_days > 0,
        "planName": subscription.plan_name,
        "totalDays": subscription.total_days,
        "remainingDays": remaining_days,
        "usedDays": used_days,
        "startDate": format_persian_date(subscription.start_date),
        "endDate": format_persian_date(subscription.end_date),
        "price": subscription.price,
        "priceLabel": format_price(subscription.price),
    }


def grant_free_trial_subscription(user):
    if not user or user.subscriptions.exists():
        return None

    start_date = current_local_date()
    end_date = start_date + timedelta(days=FREE_TRIAL_DAYS - 1)
    return UserSubscription.objects.create(
        user=user,
        plan=None,
        plan_name=f"اشتراک رایگان {to_persian_digits(FREE_TRIAL_DAYS)} روزه",
        price=0,
        total_days=FREE_TRIAL_DAYS,
        start_date=start_date,
        end_date=end_date,
        is_active=True,
    )


def weekly_plan_limit_window():
    today = current_local_date()
    days_since_saturday = (today.weekday() - 5) % 7
    return today - timedelta(days=days_since_saturday)


def serialize_weekly_plan(plan):
    if not plan:
        return None

    return {
        "id": plan.id,
        "planId": plan.id,
        "startDate": plan.start_date.isoformat(),
        "status": plan.status,
        "dailyPlan": plan.daily_plan,
        "recommendations": plan.recommendations,
        "markdown": plan.markdown,
        "source": plan.source,
        "createdAt": plan.created_at.isoformat(),
    }


def week_from_date(start):
    return [
        {
            "day": WEEKDAY_TO_PERSIAN[(start + timedelta(days=i)).weekday()],
            "date": format_persian_date(start + timedelta(days=i)),
        }
        for i in range(7)
    ]


def week_from_tomorrow():
    return week_from_date(current_local_date() + timedelta(days=1))


def serialize_profile(user):
    if not user:
        return None
    subscription = active_subscription_for_user(user)
    subscription_days = subscription_remaining_days(subscription)
    return {
        "name": user.name or "",
        "email": user.email or "",
        "phone": user.phone or "",
        "bio": user.bio or "",
        "grade": user.grade or "",
        "major": user.major or "",
        "targetRank": user.target_rank or "",
        "studyHours": user.daily_study_hours,
        "onboardingCompleted": user.onboarding_completed,
        "subscription_days": subscription_days,
        "subscriptionActive": subscription_days > 0,
        "isAdmin": bool(getattr(user, "is_admin", False)),
    }


def serialize_task(task):
    return {
        "id": task.id,
        "title": task.title,
        "duration": task.duration,
        "completed": task.is_completed,
        "category": task.category,
        "scheduledDate": task.scheduled_date.isoformat(),
    }


def infer_task_category(title, fallback="برنامه"):
    text = str(title or "").strip()
    if not text:
        return fallback
    for separator in [" - ", "-", "–", "—", ":"]:
        if separator in text:
            candidate = text.split(separator, 1)[0].strip()
            if candidate:
                return candidate[:100]
    return text.split()[0][:100] if text.split() else fallback


def plan_text_to_task_entries(plan_text, fallback_duration="", fallback_category="برنامه"):
    text = str(plan_text or "").strip()
    if not text or text == "استراحت و بازیابی":
        return []

    normalized = re.sub(r"\s*[·•]\s*", "\n", text)
    normalized = re.sub(r"\s+\|\s+", "\n", normalized)
    chunks = [
        part.strip(" -\t")
        for part in re.split(r"\n+|(?:^|\s)\d+[\).\s]+", normalized)
        if part.strip(" -\t")
    ]

    entries = []
    time_pattern = re.compile(r"((?:[۰-۹0-9]{1,2}:[۰-۹0-9]{2})\s*تا\s*(?:[۰-۹0-9]{1,2}:[۰-۹0-9]{2}))")
    for chunk in chunks:
        match = time_pattern.search(chunk)
        duration = fallback_duration
        title = chunk
        if match:
            duration = re.sub(r"\s+", " ", match.group(1)).strip()
            title = (chunk[:match.start()] + chunk[match.end():]).strip(" -\t")

        title = re.sub(r"\s+", " ", title).strip()
        if not title:
            continue

        entries.append({
            "title": title[:255],
            "duration": str(duration or "").strip(),
            "category": infer_task_category(title, fallback_category),
        })

    if entries:
        return entries

    return [{
        "title": text[:255],
        "duration": str(fallback_duration or "").strip(),
        "category": fallback_category,
    }]


PRACTICE_ALL_TOPICS = "همه مباحث"
PRACTICE_ALL_GRADES = "جامع"
PRACTICE_DEFAULT_COUNT_OPTIONS = [5, 10, 15, 20, 25, 30]
PRACTICE_MAX_QUESTIONS = 50
PRACTICE_ENABLE_TOPICS = env_flag("PRACTICE_ENABLE_TOPICS", False)
PRACTICE_ENABLE_EXPLANATIONS = env_flag("PRACTICE_ENABLE_EXPLANATIONS", False)
PRACTICE_ENABLE_DIFFICULTY = env_flag("PRACTICE_ENABLE_DIFFICULTY", False)
PRACTICE_COMMON_GRADES = ["دهم", "یازدهم", "دوازدهم", PRACTICE_ALL_GRADES]
PRACTICE_CATALOG = {
    "ریاضی": [
        {"name": "حسابان", "grades": PRACTICE_COMMON_GRADES},
        {"name": "هندسه", "grades": PRACTICE_COMMON_GRADES},
        {"name": "شیمی", "grades": PRACTICE_COMMON_GRADES},
        {"name": "فیزیک", "grades": PRACTICE_COMMON_GRADES},
        {"name": "گسسته", "grades": ["دوازدهم", PRACTICE_ALL_GRADES]},
        {"name": "آمار", "grades": ["یازدهم", PRACTICE_ALL_GRADES]},
    ],
    "تجربی": [
        {"name": "ریاضی", "grades": PRACTICE_COMMON_GRADES},
        {"name": "فیزیک", "grades": PRACTICE_COMMON_GRADES},
        {"name": "شیمی", "grades": PRACTICE_COMMON_GRADES},
        {"name": "زیست", "grades": PRACTICE_COMMON_GRADES},
    ],
}


def normalize_practice_major(value, user=None):
    major = validate_major(value or "")
    if major:
        return major
    if user:
        major = validate_major(user.major or "")
        if major:
            return major
    return "تجربی"


def practice_lessons_for_major(major):
    return [
        {"name": item["name"], "grades": list(item["grades"])}
        for item in PRACTICE_CATALOG.get(major, PRACTICE_CATALOG["تجربی"])
    ]


def practice_lesson_map(major):
    return {item["name"]: item["grades"] for item in practice_lessons_for_major(major)}


def default_practice_lesson(major):
    lessons = practice_lessons_for_major(major)
    return lessons[0]["name"] if lessons else ""


def normalize_practice_lesson(major, lesson):
    lesson_map = practice_lesson_map(major)
    if lesson in lesson_map:
        return lesson
    return default_practice_lesson(major)


def normalize_practice_grade(major, lesson, grade, user=None):
    grades = practice_lesson_map(major).get(lesson, [])
    if grade in grades:
        return grade
    if user and user.grade in grades:
        return user.grade
    if PRACTICE_ALL_GRADES in grades:
        return PRACTICE_ALL_GRADES
    return grades[0] if grades else ""


def practice_question_queryset(major, lesson, grade, topic=""):
    queryset = QuizQuestion.objects.filter(
        lesson=lesson,
        major__in=[major, "مشترک"],
    ).exclude(question_image="")

    if grade and grade != PRACTICE_ALL_GRADES:
        queryset = queryset.filter(grade=grade)
    elif grade == PRACTICE_ALL_GRADES:
        grade_options = [
            item_grade
            for item_grade in practice_lesson_map(major).get(lesson, [])
        ]
        if grade_options:
            queryset = queryset.filter(grade__in=grade_options)

    if PRACTICE_ENABLE_TOPICS and topic and topic != PRACTICE_ALL_TOPICS:
        queryset = queryset.filter(topic=topic)

    return queryset


def practice_topics_for_selection(major, lesson, grade):
    if not PRACTICE_ENABLE_TOPICS:
        return [PRACTICE_ALL_TOPICS]

    topics = list(
        practice_question_queryset(major, lesson, grade)
        .exclude(topic="")
        .order_by("topic")
        .values_list("topic", flat=True)
        .distinct()
    )
    return [PRACTICE_ALL_TOPICS, *topics] if topics else [PRACTICE_ALL_TOPICS]


def serialize_practice_question(question, request=None):
    image_url = ""
    if question.question_image:
        if question.question_image.startswith(("http://", "https://", "data:")):
            image_url = question.question_image
        else:
            image_url = f"{settings.MEDIA_URL}{question.question_image.lstrip('/')}"
            if request is not None:
                image_url = request.build_absolute_uri(image_url)

    payload = {
        "id": question.id,
        "major": question.major,
        "lesson": question.lesson,
        "grade": question.grade,
        "questionImage": image_url,
        "correctAnswer": question.correct_answer_index,
    }
    if PRACTICE_ENABLE_TOPICS:
        payload["topic"] = question.topic
    if PRACTICE_ENABLE_EXPLANATIONS:
        payload["explanation"] = question.explanation
    if PRACTICE_ENABLE_DIFFICULTY:
        payload["difficulty"] = question.difficulty
    return payload


def practice_feature_flags():
    return {
        "topics": PRACTICE_ENABLE_TOPICS,
        "explanations": PRACTICE_ENABLE_EXPLANATIONS,
        "difficulty": PRACTICE_ENABLE_DIFFICULTY,
    }


def user_stats(user):
    tasks = list(user.tasks.all())
    completed = sum(1 for t in tasks if t.is_completed)
    total = len(tasks) or 1
    readiness = round((completed / total) * 100)
    today = current_local_date()
    today_tasks = [t for t in tasks if t.scheduled_date == today]
    today_completed = sum(1 for t in today_tasks if t.is_completed)
    today_progress = round((today_completed / len(today_tasks)) * 100) if today_tasks else 0

    tasks_by_date = {}
    for task in tasks:
        tasks_by_date.setdefault(task.scheduled_date, []).append(task)

    streak = 0
    check_date = today
    if not any(t.is_completed for t in tasks_by_date.get(today, [])):
        check_date = today - timedelta(days=1)

    while True:
        day_tasks = tasks_by_date.get(check_date, [])
        if not any(t.is_completed for t in day_tasks):
            break
        streak += 1
        check_date -= timedelta(days=1)

    return {
        "readinessScore": min(readiness, 100),
        "streakCount": streak,
        "todayProgress": today_progress,
        "xpPoints": completed * 40,
    }


def current_user_profile(user):
    if not user or not user.onboarding_completed:
        return {
            "name": user.name if user else "دانش‌آموز منتورا",
            "grade": user.grade if user and user.grade else "دوازدهم",
            "major": user.major if user and user.major else "تجربی",
            "exam_year": "1405",
            "goal": f"رسیدن به رتبه {user.target_rank or 'هدف'}" if user else "افزایش تراز و اجرای منظم برنامه",
            "targetRank": user.target_rank if user else "",
            "studyHours": user.daily_study_hours if user else 6,
        }
    return {
        "name": user.name or "دانش‌آموز منتورا",
        "grade": user.grade,
        "major": user.major,
        "exam_year": "1405",
        "goal": f"رسیدن به رتبه {user.target_rank or 'هدف'}",
        "targetRank": user.target_rank,
        "studyHours": user.daily_study_hours,
    }


def normalize_planning_payload(data, user):
    base_profile = current_user_profile(user)
    raw_student = data.get("student") or {}
    major = raw_student.get("major") or data.get("major") or base_profile["major"]
    grade = raw_student.get("grade") or data.get("grade") or base_profile["grade"]

    if normalize_major:
        major = normalize_major(major)
    elif validate_major(major):
        major = validate_major(major)
    if normalize_grade:
        grade = normalize_grade(grade)
    elif validate_grade(grade):
        grade = validate_grade(grade)

    student = {
        "name": raw_student.get("name") or data.get("name") or base_profile["name"],
        "grade": grade,
        "major": major,
        "exam_year": raw_student.get("exam_year") or data.get("examYear") or base_profile["exam_year"],
        "goal": raw_student.get("goal") or data.get("goal") or base_profile["goal"],
    }

    raw_availability = data.get("availability") or {}
    raw_daily_hours = raw_availability.get("daily_hours") or data.get("dailyHours") or {}
    fallback_hours = to_float(base_profile.get("studyHours"), 6)
    daily_hours = {
        day: max(0, min(16, to_float(raw_daily_hours.get(day), fallback_hours)))
        for day in DAYS
    }

    constraints = raw_availability.get("constraints") or data.get("constraints") or []
    if isinstance(constraints, str):
        constraints = [part.strip() for part in constraints.split(",") if part.strip()]

    availability = {
        "daily_hours": daily_hours,
        "weekly_hours": round(sum(daily_hours.values()), 1),
        "preferred_session_minutes": max(30, min(180, to_int(raw_availability.get("preferred_session_minutes") or data.get("preferredSessionMinutes"), 90))),
        "rest_minutes_between_sessions": max(5, min(60, to_int(raw_availability.get("rest_minutes_between_sessions") or data.get("restMinutesBetweenSessions"), 15))),
        "constraints": constraints,
    }

    courses_data = planning_courses_for_major(major)
    raw_courses = data.get("courses") or {}
    course_inputs = {}
    for course_name in courses_data.keys():
        values = raw_courses.get(course_name) or {}
        course_inputs[course_name] = {
            "student_weakness": max(1, min(5, to_int(values.get("student_weakness"), 3))),
            "target_importance": max(1, min(5, to_int(values.get("target_importance"), 3))),
            "interest": max(1, min(5, to_int(values.get("interest"), 3))),
            "backlog_hours": max(0, to_float(values.get("backlog_hours"), 0)),
            "last_test_percent": max(0, min(100, to_float(values.get("last_test_percent"), 50))),
            "notes": values.get("notes", ""),
        }

    return student, availability, course_inputs, courses_data


def planning_courses_for_major(major):
    if get_courses is None:
        return {}
    try:
        return get_courses(major)
    except ValueError:
        return get_courses("تجربی")


def profile_course_summary(profile):
    courses = profile.get("courses", {})
    return [
        {
            "name": course_name,
            "weakness": course.get("student_weakness", 3),
            "importance": course.get("target_importance", 3),
            "interest": course.get("interest", 3),
            "backlogHours": course.get("backlog_hours", 0),
            "lastTestPercent": course.get("last_test_percent", 0),
            "priorityScore": course.get("priority_score", 0),
            "recommendedWeeklyHours": course.get("recommended_weekly_hours", 0),
        }
        for course_name, course in sorted(courses.items(), key=lambda item: item[1].get("priority_score", 0), reverse=True)
    ]


def format_clock(total_minutes):
    hours = (total_minutes // 60) % 24
    minutes = total_minutes % 60
    return f"{hours:02d}:{minutes:02d}"


def build_rule_based_plan(profile, week=None):
    week = week or week_from_tomorrow()
    courses = profile_course_summary(profile)
    availability = profile.get("availability", {})
    daily_hours = availability.get("daily_hours", {})
    session_minutes = availability.get("preferred_session_minutes", 90)
    rest_minutes = availability.get("rest_minutes_between_sessions", 15)
    day_start_minutes = 8 * 60
    student = profile.get("student", {})
    top_courses = courses[:3] or [{"name": "مطالعه", "backlogHours": 0}]

    rows = []
    for index, day_info in enumerate(week):
        capacity = float(daily_hours.get(day_info["day"], 0))
        floating = 0.5 if capacity >= 2 else 0
        main_capacity = max(0, capacity - floating)
        slots_count = max(1, round((main_capacity * 60) / session_minutes)) if main_capacity else 0
        slots = []
        cursor = day_start_minutes
        for slot_index in range(slots_count):
            course = top_courses[(index + slot_index) % len(top_courses)]
            work_type = ["مطالعه", "تست", "مرور"][slot_index % 3]
            start = cursor
            end = start + session_minutes
            slots.append(f"{format_clock(start)} تا {format_clock(end)} {course['name']} - {work_type}")
            cursor = end + rest_minutes
        if not slots and capacity > 0:
            start = day_start_minutes
            end = start + 30
            slots.append(f"{format_clock(start)} تا {format_clock(end)} {top_courses[index % len(top_courses)]['name']} - مرور سبک")

        floating_course = next((course for course in top_courses if float(course.get("backlogHours") or 0) > 0), top_courses[index % len(top_courses)])
        floating_start = cursor if slots else day_start_minutes
        floating_end = floating_start + int(floating * 60)
        rows.append({
            "date": day_info["date"],
            "day": day_info["day"],
            "mainPlan": " · ".join(slots) if slots else "استراحت و بازیابی",
            "floatingPlan": f"{format_clock(floating_start)} تا {format_clock(floating_end)} جبرانی {floating_course['name']}" if floating else "شناور اختیاری",
            "totalHours": f"{capacity:g} ساعت",
        })

    strongest = courses[-1]["name"] if courses else "درس‌های پایدار"
    weakest = courses[0]["name"] if courses else "درس‌های اولویت‌دار"
    status = (
        f"{student.get('name', 'دانش‌آموز')}، اولویت این هفته با {weakest} است؛ "
        f"چون در امتیاز اولویت، ضعف یا عقب‌افتادگی بالاتری دارد. {strongest} در وضعیت قابل‌قبول‌تری است "
        "و با مرور و تست سبک حفظ می‌شود."
    )
    recommendations = [
        "هر روز ابتدا پارت سخت‌تر را انجام بده و کارهای سبک را به انتهای روز منتقل کن.",
        "بخش شناور را فقط برای جبران عقب‌افتادگی همان هفته خرج کن.",
        "آخر هفته ساعت واقعی مطالعه، کیفیت مطالعه، درصد تمرین، عقب‌افتادگی و توضیح کوتاه هر درس را ثبت کن.",
    ]
    markdown_rows = "\n".join(
        f"| {row['date']} | {row['day']} | {row['mainPlan']} | {row['floatingPlan']} | {row['totalHours']} |"
        for row in rows
    )
    markdown = f"""## وضعیت دانش‌آموز
- {status}

## برنامه روزانه هفته
| تاریخ | روز | برنامه اصلی | بخش شناور جبرانی | مجموع ساعت |
|---|---|---|---|---|
{markdown_rows}

## توصیه‌ها و آپدیت پروفایل
{chr(10).join(f'- {item}' for item in recommendations)}
"""
    return {
        "status": status,
        "dailyPlan": rows,
        "recommendations": recommendations,
        "markdown": markdown,
    }


def parse_markdown_plan(markdown, fallback):
    rows = []
    in_table = False
    for line in markdown.splitlines():
        stripped = line.strip()
        if stripped.startswith("| تاریخ | روز |"):
            in_table = True
            continue
        if in_table and stripped.startswith("|---"):
            continue
        if in_table and stripped.startswith("|"):
            cells = [cell.strip() for cell in stripped.strip("|").split("|")]
            if len(cells) == 5:
                rows.append({
                    "date": cells[0],
                    "day": cells[1],
                    "mainPlan": cells[2],
                    "floatingPlan": cells[3],
                    "totalHours": cells[4],
                })
            continue
        if in_table and not stripped.startswith("|"):
            break
    return rows or fallback["dailyPlan"]


def markdown_section(markdown, heading):
    marker = f"## {heading}"
    start = markdown.find(marker)
    if start == -1:
        return ""
    content_start = start + len(marker)
    next_heading = markdown.find("\n## ", content_start)
    if next_heading == -1:
        next_heading = len(markdown)
    return markdown[content_start:next_heading].strip()


def parse_markdown_status(markdown, fallback):
    section = markdown_section(markdown, "وضعیت دانش‌آموز")
    lines = [
        line.strip().lstrip("-").strip()
        for line in section.splitlines()
        if line.strip() and not line.strip().startswith("---")
    ]
    return " ".join(lines) or fallback["status"]


def parse_markdown_recommendations(markdown, fallback):
    section = markdown_section(markdown, "توصیه‌ها و آپدیت پروفایل")
    items = []
    for line in section.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("|") or stripped.startswith("---"):
            continue
        if stripped[0].isdigit() and "." in stripped[:4]:
            stripped = stripped.split(".", 1)[1].strip()
        stripped = stripped.lstrip("-").strip()
        if stripped:
            items.append(stripped)
    return items[:5] or fallback["recommendations"]


def create_tasks_from_plan(user, daily_plan, start_date):
    user.tasks.filter(scheduled_date__gte=start_date).delete()
    created = []
    for index, day_row in enumerate(daily_plan):
        task_date = start_date + timedelta(days=index)
        created.extend(create_tasks_for_plan_day(user, day_row, task_date))
    return created


def create_tasks_for_plan_day(user, day_row, task_date):
    created = []
    main_plan = day_row.get("mainPlan", "")
    for entry in plan_text_to_task_entries(
        main_plan,
        fallback_duration=day_row.get("totalHours", ""),
        fallback_category=day_row.get("day", "برنامه"),
    ):
        task = DailyTask.objects.create(
            user=user,
            title=entry["title"],
            duration=entry["duration"],
            is_completed=False,
            category=entry["category"],
            scheduled_date=task_date,
        )
        created.append(task)
    floating = day_row.get("floatingPlan", "")
    if floating and "اختیاری" not in floating:
        for entry in plan_text_to_task_entries(
            floating,
            fallback_duration="شناور",
            fallback_category=f"{day_row.get('day', '')} - جبرانی",
        ):
            task = DailyTask.objects.create(
                user=user,
                title=entry["title"],
                duration=entry["duration"] or "شناور",
                is_completed=False,
                category=entry["category"],
                scheduled_date=task_date,
            )
            created.append(task)
    return created


def ensure_today_tasks_from_latest_plan(user, today):
    if user.tasks.filter(scheduled_date=today).exists():
        return

    latest_plan = user.weekly_plans.order_by("-created_at").first()
    if not latest_plan or not latest_plan.daily_plan:
        return

    plan_start = latest_plan.start_date
    day_index = (today - plan_start).days
    created_today = timezone.localtime(latest_plan.created_at).date() == today
    if day_index < 0 and created_today:
        day_index = 0

    if day_index < 0 or day_index >= len(latest_plan.daily_plan):
        return

    create_tasks_for_plan_day(user, latest_plan.daily_plan[day_index], today)


def tutor_error_response(message, status=500):
    return Response({"error": message}, status=status)


def friendly_tutor_error(exc=None, kind="general"):
    text = str(exc or "").lower()

    if kind == "config":
        return "اتصال مربی هوشمند هنوز کامل تنظیم نشده است. لطفاً کمی بعد دوباره امتحان کن."

    if kind == "validation":
        return "برای حل سوال، لطفاً متن سوال یا تصویر واضح آن را ارسال کن."

    if "503" in text or "unavailable" in text or "high demand" in text or "overloaded" in text:
        return "الان فشار روی مدل هوشمند زیاد است. لطفاً چند لحظه دیگر همین سوال را دوباره بفرست."

    if "timeout" in text or "timed out" in text:
        return "پاسخ‌گویی بیش از حد طول کشید. لطفاً دوباره تلاش کن یا تصویر واضح‌تری بفرست."

    if "api key" in text or "not installed" in text or "configuration" in text:
        return "اتصال مربی هوشمند هنوز کامل تنظیم نشده است. لطفاً کمی بعد دوباره امتحان کن."

    return "منتورا نتوانست این پاسخ را آماده کند. لطفاً سوال را کمی واضح‌تر یا دوباره ارسال کن."


# ── Auth endpoints ──

@api_view(["POST"])
def register(request):
    """ثبت‌نام مستقیم با شماره موبایل و رمز عبور."""
    phone = (request.data.get("phone") or request.data.get("email") or "").strip()
    name = (request.data.get("name") or request.data.get("fullName") or "").strip()
    password = request.data.get("password") or ""
    confirm = request.data.get("confirmPassword") or password

    if not phone or not name or not password:
        return Response({"error": "نام، شماره موبایل و رمز عبور الزامی است."}, status=400)
    if len(phone) < 10:
        return Response({"error": "شماره موبایل معتبر نیست."}, status=400)
    if password != confirm:
        return Response({"error": "رمز عبور و تکرار آن یکسان نیست."}, status=400)
    if len(password) < 6:
        return Response({"error": "رمز عبور باید حداقل ۶ کاراکتر باشد."}, status=400)
    if User.objects.filter(phone=phone).exists():
        return Response({"error": "این شماره موبایل قبلاً ثبت شده است."}, status=400)

    user = User.objects.create(
        name=name,
        phone=phone,
        password=hash_password(password),
        is_phone_verified=False,
        onboarding_completed=False,
    )
    grant_free_trial_subscription(user)
    token = generate_token(user)

    return Response({
        "message": "ثبت‌نام با موفقیت انجام شد.",
        "token": token,
        "profile": serialize_profile(user),
    })


@api_view(["POST"])
def login_send_otp(request):
    """مرحله ۱ ورود با OTP: ارسال کد به کاربر موجود"""

    phone = (request.data.get("phone") or "").strip()

    if not phone:
        return Response({"error": "شماره موبایل الزامی است."}, status=400)

    if len(phone) < 10:
        return Response({"error": "شماره موبایل معتبر نیست."}, status=400)

    try:
        user = User.objects.get(phone=phone)
    except User.DoesNotExist:
        return Response({"error": "کاربری با این شماره موبایل وجود ندارد."}, status=404)

    code = OTPCode.generate_code()
    OTPCode.objects.create(phone=phone, code=code)

    try:
        sms_send_otp(phone, code)
    except RuntimeError as exc:
        return Response({"error": str(exc)}, status=500)

    return Response({
        "message": "کد ورود ارسال شد.",
        "phone": phone,
    })

@api_view(["POST"])
def login_verify_otp(request):
    """مرحله ۲ ورود با OTP: تایید کد و صدور توکن"""

    phone = (request.data.get("phone") or "").strip()
    code = (request.data.get("code") or "").strip()

    if not phone or not code:
        return Response({"error": "شماره موبایل و کد تایید الزامی است."}, status=400)

    try:
        user = User.objects.get(phone=phone)
    except User.DoesNotExist:
        return Response({"error": "کاربری با این شماره موبایل وجود ندارد."}, status=404)

    otp = OTPCode.objects.filter(phone=phone, code=code, is_used=False).order_by("-created_at").first()

    if not otp or not otp.is_valid():
        return Response({"error": "کد تایید اشتباه یا منقضی شده است."}, status=400)

    otp.is_used = True
    otp.save()

    if not user.is_phone_verified:
        user.is_phone_verified = True
        user.save(update_fields=["is_phone_verified"])

    token = generate_token(user)

    return Response({
        "message": "ورود با موفقیت انجام شد.",
        "token": token,
        "profile": serialize_profile(user),
    })

@api_view(["POST"])
def send_otp(request):
    """مرحله ۱ ثبت‌نام: ارسال OTP به شماره موبایل"""
    phone = (request.data.get("phone") or "").strip()
    name = (request.data.get("name") or "").strip()
    password = request.data.get("password") or ""
    confirm = request.data.get("confirmPassword") or password

    if not phone or not name or not password:
        return Response({"error": "نام، شماره موبایل و رمز عبور الزامی است."}, status=400)
    if len(phone) < 10:
        return Response({"error": "شماره موبایل معتبر نیست."}, status=400)
    if password != confirm:
        return Response({"error": "رمز عبور و تکرار آن یکسان نیست."}, status=400)
    if len(password) < 6:
        return Response({"error": "رمز عبور باید حداقل ۶ کاراکتر باشد."}, status=400)
    if User.objects.filter(phone=phone).exists():
        return Response({"error": "این شماره موبایل قبلاً ثبت شده است."}, status=400)

    code = OTPCode.generate_code()
    OTPCode.objects.create(phone=phone, code=code)

    try:
        sms_send_otp(phone, code)
    except RuntimeError as exc:
        return Response({"error": str(exc)}, status=500)

    return Response({"message": "کد تایید ارسال شد.", "phone": phone})


@api_view(["POST"])
def verify_otp(request):
    """مرحله ۲ ثبت‌نام: تایید OTP و ساخت حساب"""
    phone = (request.data.get("phone") or "").strip()
    code = (request.data.get("code") or "").strip()
    name = (request.data.get("name") or "").strip()
    password = request.data.get("password") or ""

    if not phone or not code or not name or not password:
        return Response({"error": "همه فیلدها الزامی است."}, status=400)

    otp = OTPCode.objects.filter(phone=phone, code=code, is_used=False).first()
    if not otp or not otp.is_valid():
        return Response({"error": "کد تایید اشتباه یا منقضی شده است."}, status=400)

    otp.is_used = True
    otp.save()

    if User.objects.filter(phone=phone).exists():
        return Response({"error": "این شماره موبایل قبلاً ثبت شده است."}, status=400)

    user = User.objects.create(
        name=name,
        phone=phone,
        password=hash_password(password),
        is_phone_verified=True,
        onboarding_completed=False,
    )
    grant_free_trial_subscription(user)
    token = generate_token(user)

    return Response({
        "message": "ثبت‌نام با موفقیت انجام شد.",
        "token": token,
        "profile": serialize_profile(user),
    })

@api_view(["POST"])
def login(request):
    phone = (request.data.get("phone") or "").strip()
    password = request.data.get("password") or ""

    if not phone or not password:
        return Response({"error": "شماره موبایل و رمز عبور الزامی است."}, status=400)

    try:
        user = User.objects.get(phone=phone)
    except User.DoesNotExist:
        return Response({"error": "شماره موبایل یا رمز عبور اشتباه است."}, status=401)

    if not verify_password(password, user.password):
        return Response({"error": "شماره موبایل یا رمز عبور اشتباه است."}, status=401)

    token = generate_token(user)
    return Response({
        "message": "ورود موفقیت‌آمیز بود.",
        "token": token,
        "profile": serialize_profile(user),
    })


@api_view(["POST"])
def logout(request):
    return Response({"message": "خروج با موفقیت انجام شد."})


@api_view(["GET"])
@require_auth
def auth_me(request):
    user = request.mentora_user
    latest_plan = user.weekly_plans.order_by("-created_at").first()
    return Response({
        "profile": serialize_profile(user),
        "latestWeeklyPlan": serialize_weekly_plan(latest_plan),
    })


@api_view(["POST"])
@require_auth
def onboarding(request):
    user = request.mentora_user
    data = request.data
    grade = validate_grade(data.get("grade") or data.get("Grade") or "")
    major = validate_major(data.get("major") or data.get("Major") or "")
    target_rank = data.get("targetRank") or data.get("TargetRank") or ""
    study_hours = to_int(data.get("studyHours") or data.get("StudyHours"), user.daily_study_hours)

    if not grade or not major:
        return Response({"error": "پایه باید یازدهم یا دوازدهم و رشته باید ریاضی یا تجربی باشد."}, status=400)

    user.grade = grade
    user.major = major
    user.target_rank = target_rank
    user.daily_study_hours = study_hours
    user.onboarding_completed = True
    user.save()

    return Response({
        "message": "پروفایل تحصیلی با موفقیت ثبت شد.",
        "profile": serialize_profile(user),
        "tasks": [],
    })


@api_view(["GET"])
@require_auth
def planning_courses(request):
    user = request.mentora_user
    major = request.GET.get("major") or user.major or "تجربی"
    try:
        if normalize_major:
            major = normalize_major(major)
        elif validate_major(major):
            major = validate_major(major)
        courses = planning_courses_for_major(major)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)

    return Response({
        "major": major,
        "courses": [
            {
                "name": course_name,
                "baseDifficulty": data.get("base_difficulty", 3),
                "weeklyHoursRequired": data.get("weekly_hours_required", 0),
            }
            for course_name, data in courses.items()
        ],
    })


@api_view(["POST"])
@require_auth
def weekly_planning(request):
    user = request.mentora_user
    if build_profile is None or build_planning_prompt is None:
        return Response({"error": "ماژول Planning Assistant در پروژه پیدا نشد."}, status=500)

    week_start = weekly_plan_limit_window()
    generated_this_week = user.weekly_plans.filter(created_at__date__gte=week_start).count()
    if generated_this_week >= WEEKLY_PLANNING_LIMIT:
        return Response({
            "error": f"سقف تولید برنامه این هفته تمام شده است. هر کاربر در هر هفته می‌تواند {to_persian_digits(WEEKLY_PLANNING_LIMIT)} برنامه دریافت کند.",
            "plansUsedThisWeek": generated_this_week,
            "plansRemainingThisWeek": 0,
            "weeklyLimit": WEEKLY_PLANNING_LIMIT,
        }, status=429)

    try:
        student, availability, course_inputs, courses_data = normalize_planning_payload(request.data, user)
        profile = build_profile(student, availability, course_inputs, courses_data)
        start_date = current_local_date()
        week = week_from_date(start_date)
        prompt = build_planning_prompt(profile, courses_data)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)

    fallback = build_rule_based_plan(profile, week)
    source = "rule_based"
    markdown = fallback["markdown"]

    if os.environ.get("MODEL_API"):
        try:
            from llm import generate
            generated = generate(prompt)
            if generated and generated.strip():
                markdown = generated
                source = "llm"
            else:
                fallback["generationError"] = "پاسخ خالی از مدل زبانی دریافت شد."
        except Exception as exc:
            fallback["generationError"] = str(exc)
    else:
        fallback["generationError"] = "MODEL_API تنظیم نشده؛ از برنامه قاعده‌محور استفاده شد."

    daily_plan = parse_markdown_plan(markdown, fallback)
    for i, row in enumerate(daily_plan):
        if i < len(week):
            row["date"] = week[i]["date"]
            row["day"] = week[i]["day"]

    status_text = parse_markdown_status(markdown, fallback)
    recommendations = parse_markdown_recommendations(markdown, fallback)

    WeeklyPlan.objects.filter(user=user, start_date__gte=start_date).delete()
    weekly_plan = WeeklyPlan.objects.create(
        user=user,
        status=status_text,
        recommendations=recommendations,
        daily_plan=daily_plan,
        markdown=markdown,
        source=source,
        start_date=start_date,
    )
    created_tasks = create_tasks_from_plan(user, daily_plan, start_date)

    user.grade = student.get("grade") or user.grade
    user.major = student.get("major") or user.major
    user.save(update_fields=["grade", "major"])

    return Response({
        "message": "برنامه هفتگی با موفقیت تولید و ذخیره شد.",
        "source": source,
        "profile": profile,
        "courseSummary": profile_course_summary(profile),
        "status": status_text,
        "dailyPlan": daily_plan,
        "recommendations": recommendations,
        "markdown": markdown,
        "startDate": start_date.isoformat(),
        "planId": weekly_plan.id,
        "tasksCreated": len(created_tasks),
        "generationError": fallback.get("generationError"),
        "plansUsedThisWeek": generated_this_week + 1,
        "plansRemainingThisWeek": max(0, WEEKLY_PLANNING_LIMIT - generated_this_week - 1),
        "weeklyLimit": WEEKLY_PLANNING_LIMIT,
    })


@api_view(["GET"])
@require_auth
def weekly_plans_list(request):
    user = request.mentora_user
    plans = user.weekly_plans.order_by("-created_at")[:10]
    return Response({
        "plans": [serialize_weekly_plan(p) for p in plans],
    })


@api_view(["GET"])
@require_auth
def practice_filters(request):
    user = request.mentora_user
    major = normalize_practice_major(request.GET.get("major"), user)
    lesson = normalize_practice_lesson(major, request.GET.get("lesson") or "")
    grade = normalize_practice_grade(major, lesson, request.GET.get("grade") or "", user)
    topics = practice_topics_for_selection(major, lesson, grade)
    topic = request.GET.get("topic") or (topics[0] if topics else PRACTICE_ALL_TOPICS)
    if topic not in topics:
        topic = topics[0] if topics else PRACTICE_ALL_TOPICS

    return Response({
        "major": major,
        "lessons": practice_lessons_for_major(major),
        "selectedLesson": lesson,
        "selectedGrade": grade,
        "selectedTopic": topic,
        "topics": topics,
        "questionCounts": PRACTICE_DEFAULT_COUNT_OPTIONS,
        "features": practice_feature_flags(),
        "availableCount": practice_question_queryset(major, lesson, grade, topic).count(),
    })


@api_view(["POST"])
@require_auth
def practice_questions(request):
    user = request.mentora_user
    major = normalize_practice_major(request.data.get("major"), user)
    lesson = request.data.get("lesson") or ""
    grade = request.data.get("grade") or ""
    topic = request.data.get("topic") or PRACTICE_ALL_TOPICS
    count = max(1, min(PRACTICE_MAX_QUESTIONS, to_int(request.data.get("count"), 10)))

    lesson_map = practice_lesson_map(major)
    if lesson not in lesson_map:
        return Response({"error": "درس انتخاب‌شده برای این رشته معتبر نیست."}, status=400)
    if grade not in lesson_map[lesson]:
        return Response({"error": "پایه انتخاب‌شده برای این درس معتبر نیست."}, status=400)

    topics = practice_topics_for_selection(major, lesson, grade)
    if PRACTICE_ENABLE_TOPICS and topic not in topics:
        return Response({"error": "مبحث انتخاب‌شده برای این درس و پایه پیدا نشد."}, status=400)
    if not PRACTICE_ENABLE_TOPICS:
        topic = PRACTICE_ALL_TOPICS

    queryset = practice_question_queryset(major, lesson, grade, topic)
    available_count = queryset.count()
    if not available_count:
        return Response({
            "error": "برای این ترکیب درس، پایه و مبحث هنوز سوالی در بانک سوال ثبت نشده است.",
            "availableCount": 0,
        }, status=404)

    questions = list(queryset.order_by("?")[:count])
    return Response({
        "major": major,
        "lesson": lesson,
        "grade": grade,
        "topic": topic,
        "requestedCount": count,
        "availableCount": available_count,
        "features": practice_feature_flags(),
        "questions": [serialize_practice_question(question, request) for question in questions],
    })


@api_view(["GET"])
@require_auth
def subscription_plans(request):
    plans = SubscriptionPlan.objects.filter(is_active=True).order_by("duration_days")
    return Response({
        "plans": [serialize_subscription_plan(plan) for plan in plans],
    })


@api_view(["GET"])
@require_auth
def subscription_status(request):
    user = request.mentora_user
    subscription = active_subscription_for_user(user)
    return Response({
        "subscription": serialize_subscription(subscription),
        "profile": serialize_profile(user),
    })


@api_view(["POST"])
@require_auth
def activate_subscription(request):
    user = request.mentora_user
    plan_id = request.data.get("planId") or request.data.get("id")
    slug = request.data.get("slug")
    activation_code = str(
        request.data.get("activationCode") or request.data.get("code") or ""
    ).strip()

    if not activation_code:
        return Response({
            "error": "برای فعال‌سازی یا تمدید اشتراک، کد فعال‌سازی را وارد کن.",
        }, status=400)

    if activation_code != SUBSCRIPTION_ACTIVATION_CODE:
        return Response({
            "error": "کد فعال‌سازی اشتراک درست نیست.",
        }, status=403)

    try:
        if slug:
            plan = SubscriptionPlan.objects.get(slug=slug, is_active=True)
        else:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
    except (SubscriptionPlan.DoesNotExist, ValueError, TypeError):
        return Response({"error": "پلن انتخاب‌شده پیدا نشد."}, status=404)

    current_subscription = active_subscription_for_user(user)
    remaining_days = subscription_remaining_days(current_subscription)
    total_days = plan.duration_days + remaining_days
    start_date = current_local_date()
    end_date = start_date + timedelta(days=max(total_days, 1) - 1)

    user.subscriptions.filter(is_active=True).update(is_active=False)
    subscription = UserSubscription.objects.create(
        user=user,
        plan=plan,
        plan_name=plan.name,
        price=plan.price,
        total_days=total_days,
        start_date=start_date,
        end_date=end_date,
        is_active=True,
    )

    return Response({
        "message": "اشتراک شما با موفقیت فعال شد.",
        "subscription": serialize_subscription(subscription),
        "profile": serialize_profile(user),
    })


@api_view(["GET"])
@require_auth
def today_plan(request):
    user = request.mentora_user
    today = current_local_date()
    tomorrow = today + timedelta(days=1)
    ensure_today_tasks_from_latest_plan(user, today)
    tasks = user.tasks.filter(scheduled_date=today).order_by("id")
    upcoming_count = user.tasks.filter(scheduled_date=tomorrow).count()
    stats = user_stats(user)
    persian_date = format_persian_date(today)

    return Response({
        "profile": serialize_profile(user),
        "tasks": [serialize_task(t) for t in tasks],
        "upcomingTasksCount": upcoming_count,
        "programStartsTomorrow": upcoming_count > 0 and tasks.count() == 0,
        "readinessScore": stats["readinessScore"],
        "streakCount": stats["streakCount"],
        "todayProgress": stats["todayProgress"],
        "xpPoints": stats["xpPoints"],
        "calendarDate": persian_date,
        "today": today.isoformat(),
    })


@api_view(["POST"])
@require_auth
def create_task(request):
    user = request.mentora_user
    title = str(request.data.get("title") or "").strip()
    if not title:
        return Response({"error": "عنوان تسک الزامی است."}, status=400)

    scheduled_date_text = request.data.get("scheduledDate") or request.data.get("scheduled_date")
    scheduled_date = current_local_date()
    if scheduled_date_text:
        try:
            scheduled_date = datetime.fromisoformat(str(scheduled_date_text)).date()
        except ValueError:
            return Response({"error": "تاریخ تسک معتبر نیست."}, status=400)

    task = DailyTask.objects.create(
        user=user,
        title=title[:255],
        duration=str(request.data.get("duration") or "").strip(),
        category=str(request.data.get("category") or infer_task_category(title, "شخصی")).strip()[:100],
        scheduled_date=scheduled_date,
        is_completed=bool(request.data.get("completed") or request.data.get("is_completed") or False),
    )
    stats = user_stats(user)

    return Response({
        "task": serialize_task(task),
        "readinessScore": stats["readinessScore"],
        "streakCount": stats["streakCount"],
        "todayProgress": stats["todayProgress"],
        "xpPoints": stats["xpPoints"],
    }, status=201)


@api_view(["PATCH", "DELETE"])
@require_auth
def update_task(request, task_id):
    user = request.mentora_user
    try:
        task = DailyTask.objects.get(id=task_id, user=user)
    except DailyTask.DoesNotExist:
        return Response({"error": "تسک مورد نظر پیدا نشد."}, status=404)

    if request.method == "DELETE":
        task.delete()
        stats = user_stats(user)
        return Response({
            "deleted": True,
            "taskId": task_id,
            "readinessScore": stats["readinessScore"],
            "streakCount": stats["streakCount"],
            "todayProgress": stats["todayProgress"],
            "xpPoints": stats["xpPoints"],
        })

    update_fields = []
    if "completed" in request.data or "is_completed" in request.data:
        completed = request.data.get("completed")
        if completed is None:
            completed = request.data.get("is_completed")
        task.is_completed = bool(completed)
        update_fields.append("is_completed")

    if "title" in request.data:
        title = str(request.data.get("title") or "").strip()
        if not title:
            return Response({"error": "عنوان تسک نمی‌تواند خالی باشد."}, status=400)
        task.title = title[:255]
        update_fields.append("title")

    if "duration" in request.data:
        task.duration = str(request.data.get("duration") or "").strip()
        update_fields.append("duration")

    if "category" in request.data:
        task.category = str(request.data.get("category") or "عمومی").strip()[:100]
        update_fields.append("category")

    scheduled_date_text = request.data.get("scheduledDate") or request.data.get("scheduled_date")
    if scheduled_date_text:
        try:
            task.scheduled_date = datetime.fromisoformat(str(scheduled_date_text)).date()
        except ValueError:
            return Response({"error": "تاریخ تسک معتبر نیست."}, status=400)
        update_fields.append("scheduled_date")

    if update_fields:
        task.save(update_fields=list(dict.fromkeys(update_fields)))
    stats = user_stats(user)

    return Response({
        "task": serialize_task(task),
        "readinessScore": stats["readinessScore"],
        "streakCount": stats["streakCount"],
        "todayProgress": stats["todayProgress"],
        "xpPoints": stats["xpPoints"],
    })


@api_view(["GET", "POST"])
@require_auth
def chat_history(request):
    user = request.mentora_user
    if request.method == "GET":
        messages = user.chat_messages.order_by("created_at")[:100]
        return Response({
            "messages": [
                {
                    "id": m.id,
                    "role": "user" if m.role == "user" else "model",
                    "content": m.content,
                    "timestamp": m.created_at.isoformat(),
                }
                for m in messages
            ],
        })
    return Response({"error": "Method not allowed"}, status=405)


@api_view(["POST"])
@require_auth
def chat(request):
    user = request.mentora_user
    action = request.data.get("action", "")
    message = (request.data.get("message") or "").strip()
    image = request.FILES.get("image")

    if action and not message and image is None:
        return Response({
            "reply": "اول یک سوال یا تصویر سوال بفرست، بعد می‌توانم پاسخ را ساده‌تر کنم یا روش دیگری پیشنهاد بدهم."
        })

    if message:
        ChatMessage.objects.create(user=user, role="user", content=message)

    try:
        result = solve_student_question(message, image)
    except QuestionSolverConfigError as exc:
        return tutor_error_response(friendly_tutor_error(exc, "config"), status=503)
    except ValueError as exc:
        return tutor_error_response(friendly_tutor_error(exc, "validation"), status=400)
    except Exception as exc:
        return tutor_error_response(friendly_tutor_error(exc), status=500)

    reply = result.get("reply", "")
    if reply:
        ChatMessage.objects.create(user=user, role="assistant", content=reply)

    return Response(result)


@api_view(["GET", "PATCH"])
@require_auth
def profile_view(request):
    user = request.mentora_user

    if request.method == "PATCH":
        data = request.data
        if "name" in data:
            user.name = data["name"]
        if "email" in data and data["email"]:
            new_email = data["email"].strip().lower()
            if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                return Response({"error": "این ایمیل قبلاً استفاده شده است."}, status=400)
            user.email = new_email
        if "phone" in data:
            user.phone = data["phone"]
        if "bio" in data:
            user.bio = data["bio"]
        if "grade" in data:
            grade = validate_grade(data["grade"])
            if not grade:
                return Response({"error": "پایه باید یازدهم یا دوازدهم باشد."}, status=400)
            user.grade = grade
        if "major" in data:
            major = validate_major(data["major"])
            if not major:
                return Response({"error": "رشته باید ریاضی یا تجربی باشد."}, status=400)
            user.major = major
        if "targetRank" in data:
            user.target_rank = data["targetRank"]
        if "studyHours" in data:
            user.daily_study_hours = to_int(data["studyHours"], user.daily_study_hours)
        user.save()

    latest_plan = user.weekly_plans.order_by("-created_at").first()
    chat_count = user.chat_messages.count()

    return Response({
        "profile": serialize_profile(user),
        "latestWeeklyPlan": {
            "id": latest_plan.id,
            "startDate": latest_plan.start_date.isoformat(),
            "status": latest_plan.status,
            "dailyPlan": latest_plan.daily_plan,
            "recommendations": latest_plan.recommendations,
            "createdAt": latest_plan.created_at.isoformat(),
        } if latest_plan else None,
        "chatMessageCount": chat_count,
    })


REPORT_TOPICS = {
    "ریاضی": [
        {"name": "حد و پیوستگی", "level": "خوب", "color": "#10b981", "percent": 85},
        {"name": "هندسه تحلیلی", "level": "نیازمند مرور", "color": "#fbbf24", "percent": 62},
        {"name": "مشتق و کاربرد", "level": "ضعف جدی", "color": "#f43f5e", "percent": 38},
        {"name": "ماتریس و دترمینان", "level": "خوب", "color": "#10b981", "percent": 90},
        {"name": "فیزیک حرکت‌شناسی", "level": "ضعف جدی", "color": "#f43f5e", "percent": 45},
        {"name": "دینامیک و نیرو", "level": "نیازمند مرور", "color": "#fbbf24", "percent": 55},
    ],
    "تجربی": [
        {"name": "زیست پیش‌دانشگاهی (ژنتیک)", "level": "ضعف جدی", "color": "#f43f5e", "percent": 32},
        {"name": "حد و پیوستگی ریاضی", "level": "خوب", "color": "#10b981", "percent": 88},
        {"name": "شیمی دوازدهم (الکتروشیمی)", "level": "نیازمند مرور", "color": "#fbbf24", "percent": 58},
        {"name": "شیمی پایه (اسید و باز)", "level": "ضعف جدی", "color": "#f43f5e", "percent": 40},
        {"name": "فیزیک حرکت‌شناسی", "level": "خوب", "color": "#10b981", "percent": 82},
        {"name": "زیست دوازدهم (گوارش)", "level": "خوب", "color": "#10b981", "percent": 92},
    ],
}


def completion_rate(tasks):
    task_list = list(tasks)
    if not task_list:
        return 0
    completed = sum(1 for task in task_list if task.is_completed)
    return round((completed / len(task_list)) * 100)


def report_level(percent):
    if percent >= 80:
        return "خوب", "#10b981"
    if percent >= 50:
        return "نیازمند مرور", "#fbbf24"
    return "ضعف جدی", "#f43f5e"


def course_names_for_major(major):
    try:
        courses = planning_courses_for_major(major)
        if courses:
            return list(courses.keys())
    except Exception:
        pass
    return ["زیست", "شیمی", "فیزیک", "ریاضی"] if major == "تجربی" else ["حسابان", "فیزیک", "شیمی", "گسسته", "هندسه"]


def task_matches_course(task, course_name):
    haystack = f"{task.title} {task.category}"
    return course_name in haystack


def planned_hours_from_plan(plan):
    if not plan:
        return 0
    return round(sum(parse_duration_hours(day.get("totalHours")) for day in plan.daily_plan or []), 1)


def task_hours(tasks, completed_only=False):
    selected = [task for task in tasks if task.is_completed or not completed_only]
    return round(sum(parse_duration_hours(task.duration) for task in selected), 1)


def report_window_for_user(user):
    latest_plan = user.weekly_plans.order_by("-created_at").first()
    if latest_plan:
        start = latest_plan.start_date
        end = start + timedelta(days=6)
    else:
        end = current_local_date()
        start = end - timedelta(days=6)
    return latest_plan, start, end


@api_view(["GET"])
@require_auth
def reports(request):
    user = request.mentora_user
    major = user.major if user.major in VALID_MAJORS else "تجربی"
    latest_plan, start_date, end_date = report_window_for_user(user)
    current_tasks = list(
        user.tasks
        .filter(scheduled_date__gte=start_date, scheduled_date__lte=end_date)
        .order_by("scheduled_date", "id")
    )
    previous_tasks = list(
        user.tasks
        .filter(
            scheduled_date__gte=start_date - timedelta(days=7),
            scheduled_date__lt=start_date,
        )
    )

    current_completion = completion_rate(current_tasks)
    previous_completion = completion_rate(previous_tasks)
    accuracy_growth = current_completion - previous_completion

    topics = []
    fallback_percent = current_completion
    for course_name in course_names_for_major(major):
        course_tasks = [task for task in current_tasks if task_matches_course(task, course_name)]
        percent = completion_rate(course_tasks) if course_tasks else fallback_percent
        level, color = report_level(percent)
        topics.append({
            "name": course_name,
            "level": level,
            "color": color,
            "percent": percent,
            "totalTasks": len(course_tasks),
            "completedTasks": sum(1 for task in course_tasks if task.is_completed),
        })

    topics.sort(key=lambda topic: (topic["percent"], -topic["totalTasks"]))
    primary_weakness = topics[0]["name"] if topics else ""
    planned_hours = planned_hours_from_plan(latest_plan) or task_hours(current_tasks)

    return Response({
        "major": major,
        "averageAccuracy": current_completion,
        "accuracyGrowth": accuracy_growth,
        "weeklyStudyHours": planned_hours,
        "topics": topics,
        "primaryWeakness": primary_weakness,
        "completedTasks": sum(1 for task in current_tasks if task.is_completed),
        "totalTasks": len(current_tasks),
        "completedStudyHours": task_hours(current_tasks, completed_only=True),
        "planStartDate": format_persian_date(start_date),
        "planEndDate": format_persian_date(end_date),
        "latestPlanStatus": latest_plan.status if latest_plan else "",
        "plannerRecommendations": latest_plan.recommendations if latest_plan else [],
    })
