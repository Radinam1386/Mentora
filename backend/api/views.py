import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path

from django.db.utils import OperationalError, ProgrammingError
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
from .models import ChatMessage, DailyTask, User, WeeklyPlan
from .question_solver import QuestionSolverConfigError, solve_student_question

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


def week_from_tomorrow():
    start = date.today() + timedelta(days=1)
    return [
        {
            "day": WEEKDAY_TO_PERSIAN[(start + timedelta(days=i)).weekday()],
            "date": (start + timedelta(days=i)).isoformat(),
        }
        for i in range(7)
    ]


def serialize_profile(user):
    if not user:
        return None
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


def user_stats(user):
    tasks = list(user.tasks.all())
    completed = sum(1 for t in tasks if t.is_completed)
    total = len(tasks) or 1
    readiness = round((completed / total) * 100)
    streak = 0
    check_date = date.today()
    while True:
        day_tasks = [t for t in tasks if t.scheduled_date == check_date]
        if not day_tasks:
            break
        if all(t.is_completed for t in day_tasks):
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    return {
        "readinessScore": min(readiness, 100),
        "streakCount": streak,
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
        main_plan = day_row.get("mainPlan", "")
        if main_plan and main_plan != "استراحت و بازیابی":
            task = DailyTask.objects.create(
                user=user,
                title=main_plan[:255],
                duration=day_row.get("totalHours", ""),
                is_completed=False,
                category=day_row.get("day", "برنامه"),
                scheduled_date=task_date,
            )
            created.append(task)
        floating = day_row.get("floatingPlan", "")
        if floating and "اختیاری" not in floating:
            task = DailyTask.objects.create(
                user=user,
                title=floating[:255],
                duration="شناور",
                is_completed=False,
                category=f"{day_row.get('day', '')} - جبرانی",
                scheduled_date=task_date,
            )
            created.append(task)
    return created


# ── Auth endpoints ──

@api_view(["POST"])
def register(request):
    data = request.data
    name = (data.get("name") or data.get("fullName") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm = data.get("confirmPassword") or password

    if not name or not email or not password:
        return Response({"error": "نام، ایمیل و رمز عبور الزامی است."}, status=400)
    if password != confirm:
        return Response({"error": "رمز عبور و تکرار آن یکسان نیست."}, status=400)
    if len(password) < 6:
        return Response({"error": "رمز عبور باید حداقل ۶ کاراکتر باشد."}, status=400)
    if User.objects.filter(email=email).exists():
        return Response({"error": "این ایمیل قبلاً ثبت شده است."}, status=400)

    user = User.objects.create(
        name=name,
        email=email,
        password=hash_password(password),
        onboarding_completed=False,
    )
    token = generate_token(user)
    return Response({
        "message": "ثبت‌نام با موفقیت انجام شد.",
        "token": token,
        "profile": serialize_profile(user),
    })


@api_view(["POST"])
def login(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""

    if not email or not password:
        return Response({"error": "ایمیل و رمز عبور الزامی است."}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "ایمیل یا رمز عبور اشتباه است."}, status=401)

    if not verify_password(password, user.password):
        return Response({"error": "ایمیل یا رمز عبور اشتباه است."}, status=401)

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
        "latestWeeklyPlan": {
            "id": latest_plan.id,
            "startDate": latest_plan.start_date.isoformat(),
            "status": latest_plan.status,
            "dailyPlan": latest_plan.daily_plan,
            "recommendations": latest_plan.recommendations,
            "createdAt": latest_plan.created_at.isoformat(),
        } if latest_plan else None,
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

    try:
        student, availability, course_inputs, courses_data = normalize_planning_payload(request.data, user)
        profile = build_profile(student, availability, course_inputs, courses_data)
        week = week_from_tomorrow()
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
    start_date = date.today() + timedelta(days=1)

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
    })


@api_view(["GET"])
@require_auth
def weekly_plans_list(request):
    user = request.mentora_user
    plans = user.weekly_plans.order_by("-created_at")[:10]
    return Response({
        "plans": [
            {
                "id": p.id,
                "startDate": p.start_date.isoformat(),
                "status": p.status,
                "dailyPlan": p.daily_plan,
                "recommendations": p.recommendations,
                "source": p.source,
                "createdAt": p.created_at.isoformat(),
            }
            for p in plans
        ],
    })


@api_view(["GET"])
@require_auth
def today_plan(request):
    user = request.mentora_user
    today = date.today()
    tomorrow = today + timedelta(days=1)
    tasks = user.tasks.filter(scheduled_date=today).order_by("id")
    upcoming_count = user.tasks.filter(scheduled_date=tomorrow).count()
    stats = user_stats(user)
    persian_date = today.strftime("%Y-%m-%d")

    return Response({
        "profile": serialize_profile(user),
        "tasks": [serialize_task(t) for t in tasks],
        "upcomingTasksCount": upcoming_count,
        "programStartsTomorrow": upcoming_count > 0 and tasks.count() == 0,
        "readinessScore": stats["readinessScore"],
        "streakCount": stats["streakCount"],
        "xpPoints": stats["xpPoints"],
        "calendarDate": persian_date,
        "today": today.isoformat(),
    })


@api_view(["PATCH"])
@require_auth
def update_task(request, task_id):
    user = request.mentora_user
    try:
        task = DailyTask.objects.get(id=task_id, user=user)
    except DailyTask.DoesNotExist:
        return Response({"error": "تسک مورد نظر پیدا نشد."}, status=404)

    completed = request.data.get("completed")
    if completed is None:
        completed = request.data.get("is_completed")
    task.is_completed = bool(completed)
    task.save(update_fields=["is_completed"])

    return Response({"task": serialize_task(task)})


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
        return Response({"error": str(exc)}, status=503)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)
    except Exception as exc:
        return Response({"error": f"RAG solver failed: {exc}"}, status=500)

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


@api_view(["GET"])
@require_auth
def reports(request):
    user = request.mentora_user
    major = user.major if user.major in VALID_MAJORS else "تجربی"
    topics = REPORT_TOPICS.get(major, REPORT_TOPICS["تجربی"])
    primary_weakness = next(
        (t["name"] for t in topics if t["level"] == "ضعف جدی"),
        topics[0]["name"] if topics else "",
    )
    stats = user_stats(user)

    return Response({
        "major": major,
        "averageAccuracy": stats["readinessScore"],
        "accuracyGrowth": 12,
        "weeklyStudyHours": user.daily_study_hours * 7,
        "topics": topics,
        "primaryWeakness": primary_weakness,
    })
