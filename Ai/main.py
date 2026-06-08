import argparse
from pathlib import Path

from DataStore import DATA_DIR, get_courses, get_profile_courses, list_profiles, load_profile, save_profile
from llm import generate
from profile_engine import apply_weekly_progress, build_profile
from prompt import build_planning_prompt, build_profile_update_summary
from questionnaire import collect_profile, collect_progress


SAMPLE_STUDENT = {
    "name": "دانش‌آموز نمونه",
    "grade": "دوازدهم",
    "major": "ریاضی",
    "exam_year": "1405",
    "goal": "رساندن ریاضی و فیزیک به سطح تست زمان‌دار",
}

SAMPLE_AVAILABILITY = {
    "daily_hours": {
        "شنبه": 5,
        "یکشنبه": 4,
        "دوشنبه": 5,
        "سه‌شنبه": 4,
        "چهارشنبه": 5,
        "پنجشنبه": 3,
        "جمعه": 2,
    },
    "weekly_hours": 28,
    "preferred_session_minutes": 90,
    "rest_minutes_between_sessions": 15,
    "constraints": ["جمعه سبک باشد"],
}

SAMPLE_COURSE_INPUTS = {
    "حسابان": {
        "student_weakness": 5,
        "target_importance": 5,
        "interest": 3,
        "backlog_hours": 6,
        "last_test_percent": 32,
    },
    "فیزیک": {
        "student_weakness": 4,
        "target_importance": 5,
        "interest": 4,
        "backlog_hours": 3,
        "last_test_percent": 45,
    },
    "شیمی": {
        "student_weakness": 2,
        "target_importance": 4,
        "interest": 4,
        "backlog_hours": 1,
        "last_test_percent": 68,
    },
    "گسسته": {
        "student_weakness": 3,
        "target_importance": 3,
        "interest": 2,
        "backlog_hours": 2,
        "last_test_percent": 50,
    },
    "هندسه": {
        "student_weakness": 4,
        "target_importance": 3,
        "interest": 3,
        "backlog_hours": 2,
        "last_test_percent": 42,
    },
}


def sample_profile() -> dict:
    profile = build_profile(SAMPLE_STUDENT, SAMPLE_AVAILABILITY, SAMPLE_COURSE_INPUTS, get_courses(SAMPLE_STUDENT["major"]))
    profile["student_id"] = "sample-konkur"
    return profile


def choose_profile(student_id: str | None) -> dict:
    if student_id:
        return load_profile(student_id)

    profiles = list_profiles()
    if not profiles:
        raise RuntimeError("هنوز پروفایلی ساخته نشده. اول دستور create یا sample را اجرا کن.")

    print("\nپروفایل‌های موجود:")
    for index, profile in enumerate(profiles, start=1):
        print(f"{index}. {profile['name']} ({profile['student_id']}) - آپدیت: {profile['updated_at']}")

    selected = int(input("شماره پروفایل را انتخاب کن: ").strip())
    return load_profile(profiles[selected - 1]["student_id"])


def save_prompt(prompt: str, student_id: str) -> Path:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / f"last_prompt_{student_id}.md"
    path.write_text(prompt, encoding="utf-8")
    return path


def print_profile_summary(profile: dict) -> None:
    print("\nخلاصه وضعیت دروس:")
    print(build_profile_update_summary(profile))


def command_create() -> None:
    profile = collect_profile()
    path = save_profile(profile)
    print(f"\nپروفایل ساخته و ذخیره شد: {path}")
    print_profile_summary(profile)


def command_sample() -> None:
    profile = sample_profile()
    path = save_profile(profile)
    print(f"\nپروفایل نمونه ساخته شد: {path}")
    print_profile_summary(profile)


def command_prompt(student_id: str | None) -> None:
    profile = choose_profile(student_id)
    prompt = build_planning_prompt(profile, get_profile_courses(profile))
    path = save_prompt(prompt, profile["student_id"])
    print(f"\nپرامپت خام ذخیره شد: {path}")
    print("\n--- شروع پرامپت ---\n")
    print(prompt)


def command_plan(student_id: str | None) -> None:
    profile = choose_profile(student_id)
    prompt = build_planning_prompt(profile, get_profile_courses(profile))
    prompt_path = save_prompt(prompt, profile["student_id"])

    print(f"\nپرامپت ارسال به مدل آماده شد: {prompt_path}")
    print("در حال تولید برنامه با مدل زبانی...\n")
    try:
        weekly_plan = generate(prompt)
    except Exception as exc:
        print(f"خطا در تولید برنامه: {exc}")
        print("برای تست بدون مدل، دستور prompt را اجرا کن و پرامپت ذخیره‌شده را بررسی کن.")
        return

    output_path = DATA_DIR / f"weekly_plan_{profile['student_id']}.md"
    output_path.write_text(weekly_plan, encoding="utf-8")
    print(weekly_plan)
    print(f"\nبرنامه در این فایل ذخیره شد: {output_path}")


def command_update(student_id: str | None) -> None:
    profile = choose_profile(student_id)
    progress = collect_progress(profile)
    updated_profile = apply_weekly_progress(profile, progress, get_profile_courses(profile))
    path = save_profile(updated_profile)
    print(f"\nپروفایل با گزارش جدید آپدیت شد: {path}")
    print_profile_summary(updated_profile)


def command_list() -> None:
    profiles = list_profiles()
    if not profiles:
        print("هنوز پروفایلی وجود ندارد.")
        return
    for profile in profiles:
        print(f"{profile['student_id']} | {profile['name']} | updated_at={profile['updated_at']}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="نمونه خام سیستم برنامه‌ریز شخصی‌سازی‌شده کنکور")
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("create", help="ساخت پروفایل با پرسشنامه")
    subparsers.add_parser("sample", help="ساخت پروفایل نمونه برای تست سریع")
    subparsers.add_parser("list", help="نمایش پروفایل‌های ذخیره‌شده")

    prompt_parser = subparsers.add_parser("prompt", help="ساخت و نمایش پرامپت خام برای مدل")
    prompt_parser.add_argument("--student-id")

    plan_parser = subparsers.add_parser("plan", help="تولید برنامه هفتگی با مدل زبانی")
    plan_parser.add_argument("--student-id")

    update_parser = subparsers.add_parser("update", help="ثبت گزارش هفتگی و آپدیت پروفایل")
    update_parser.add_argument("--student-id")

    return parser


def run_command(args: argparse.Namespace, parser: argparse.ArgumentParser) -> None:
    commands = {
        "create": lambda: command_create(),
        "sample": lambda: command_sample(),
        "list": lambda: command_list(),
        "prompt": lambda: command_prompt(args.student_id),
        "plan": lambda: command_plan(args.student_id),
        "update": lambda: command_update(args.student_id),
    }

    command = commands.get(args.command)
    if command is None:
        parser.print_help()
        return

    command()


def main() -> None:
    parser = build_parser()

    args = parser.parse_args()
    run_command(args, parser)


if __name__ == "__main__":
    main()
