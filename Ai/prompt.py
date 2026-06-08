import json
from typing import Any

from profile_engine import DAYS, profile_summary_for_prompt


def build_planning_prompt(student_profile: dict[str, Any], courses_data: dict[str, Any] | None = None) -> str:
    payload = {
        "student_profile": profile_summary_for_prompt(student_profile),
        "courses_catalog": courses_data or {},
        "days": DAYS,
    }
    profile_json = json.dumps(payload, ensure_ascii=False, indent=2)

    return f"""
شما یک مشاور تحصیلی خبره برای داوطلبان کنکور ایران هستید.
وظیفه شما تولید یک برنامه هفتگی شخصی‌سازی‌شده، قابل اجرا و قابل پیگیری است.

داده ورودی زیر شامل پروفایل دانش‌آموز، ظرفیت زمانی، وضعیت هر درس، عقب‌افتادگی، مباحث ضعیف، و تاریخچه عملکرد اخیر است:

```json
{profile_json}
```

قواعد برنامه‌ریزی:
1. اولویت را با درس‌هایی بده که `priority_score`، `student_weakness`، `backlog_hours` یا اهمیت هدف بالاتری دارند.
2. مجموع ساعت هر درس در هفته باید تا حد ممکن با `recommended_weekly_hours` همان درس هماهنگ باشد.
3. برنامه باید با `daily_hours` هر روز سازگار باشد و از ظرفیت روزانه بیشتر نشود.
4. هر روز را به پارت‌های مطالعه با زمان تقریبی `preferred_session_minutes` تقسیم کن و بین پارت‌ها استراحت بده.
5. برای درس‌های ضعیف فقط «مطالعه» ننویس؛ نوع کار را مشخص کن: آموزش، تست آموزشی، تست زمان‌دار، مرور، تحلیل آزمون، یا رفع اشکال.
6. مباحث موجود در `weak_topics` باید در برنامه دیده شوند.
7. اگر عقب‌افتادگی وجود دارد، آن را به شکل واقع‌بینانه در طول هفته پخش کن و برنامه را فشرده و غیرقابل اجرا نکن.
8. خروجی باید مستقل و آماده نمایش به کاربر باشد؛ درباره داده خام JSON توضیح نده.

قالب خروجی:
- عنوان کوتاه شامل نام دانش‌آموز و هفته برنامه.
- جدول روزانه از شنبه تا جمعه با ستون‌های: روز، پارت‌ها، مجموع ساعت، هدف روز.
- جدول خلاصه ساعات هر درس در کل هفته.
- بخش کوتاه «چرا این برنامه؟» با توضیح دلیل اولویت‌بندی.
- بخش «چطور گزارش بدهی؟» شامل 3 تا 5 معیار ساده برای آپدیت پروفایل در پایان هفته.

خروجی نهایی را فقط به زبان فارسی و با Markdown تمیز تولید کن.
""".strip()


def build_profile_update_summary(profile: dict[str, Any]) -> str:
    courses = profile.get("courses", {})
    rows = []
    for course_name, course in sorted(courses.items(), key=lambda item: item[1].get("priority_score", 0), reverse=True):
        rows.append(
            {
                "course": course_name,
                "weakness": course.get("student_weakness"),
                "priority_score": course.get("priority_score"),
                "recommended_weekly_hours": course.get("recommended_weekly_hours"),
                "backlog_hours": course.get("backlog_hours"),
                "last_test_percent": course.get("last_test_percent"),
            }
        )
    return json.dumps(rows, ensure_ascii=False, indent=2)
