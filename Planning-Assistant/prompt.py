import json
from datetime import date, timedelta
from typing import Any

from profile_engine import DAYS, profile_summary_for_prompt


def next_study_week(start: date | None = None) -> list[dict[str, str]]:
    today = start or date.today()
    days_until_saturday = (5 - today.weekday()) % 7
    first_day = today + timedelta(days=days_until_saturday)
    return [
        {
            "day": day_name,
            "date": (first_day + timedelta(days=index)).isoformat(),
        }
        for index, day_name in enumerate(DAYS)
    ]


def build_planning_prompt(student_profile: dict[str, Any], courses_data: dict[str, Any] | None = None) -> str:
    week_dates = next_study_week()
    payload = {
        "student_profile": profile_summary_for_prompt(student_profile),
        "courses_catalog": courses_data or {},
        "week_dates": week_dates,
    }
    profile_json = json.dumps(payload, ensure_ascii=False, indent=2)

    return f"""
شما یک مشاور تحصیلی خبره برای داوطلبان کنکور ایران هستید.
وظیفه شما تولید یک برنامه هفتگی شخصی‌سازی‌شده، قابل اجرا و قابل پیگیری است.

داده ورودی زیر شامل پروفایل دانش‌آموز، ظرفیت زمانی، وضعیت هر درس، عقب‌افتادگی، و تاریخچه عملکرد اخیر است:

```json
{profile_json}
```

قواعد برنامه‌ریزی:
1. اولویت را با درس‌هایی بده که `priority_score`، `student_weakness`، `backlog_hours` یا اهمیت هدف بالاتری دارند.
2. مجموع ساعت هر درس در هفته باید تا حد ممکن با `recommended_weekly_hours` همان درس هماهنگ باشد.
3. برنامه باید با `daily_hours` هر روز سازگار باشد و از ظرفیت روزانه بیشتر نشود.
4. هر روز را به چند پارت مطالعه با طول تقریبی `preferred_session_minutes` تقسیم کن و برای هر پارت یک بازه ساعت دقیق (مثل «۱۶:۰۰ تا ۱۷:۳۰») تعیین کن. بین پارت‌ها به اندازه `rest_minutes_between_sessions` فاصله استراحت بگذار و این فاصله‌ها را در ترتیب ساعت‌ها لحاظ کن.
5. ساعت شروع هر روز را واقع‌بینانه انتخاب کن (مثلاً صبح‌ها از حدود ۸ و بعدازظهرها از حدود ۱۶) و پارت‌ها را پشت‌سرهم و بدون تداخل بچین تا دانش‌آموز دقیقاً بداند هر درس را چه ساعتی بخواند.
6. در هر روز حتما یک «بخش شناور جبرانی» با یک بازه ساعت مشخص بگذار تا اگر دانش‌آموز از برنامه عقب افتاد، آن بازه را برای جبران استفاده کند.
7. ریزمبحث، فصل، عنوان جزئی، شماره تست یا نام مبحث ننویس. فقط نام درس و نوع کلی کار را بنویس؛ مثل «مطالعه فیزیک»، «مرور شیمی»، «تست ریاضی».
8. اگر عقب‌افتادگی وجود دارد، آن را واقع‌بینانه در طول هفته و مخصوصا در بخش‌های شناور پخش کن و برنامه را فشرده و غیرقابل اجرا نکن.
9. از تاریخ‌های موجود در `week_dates` استفاده کن و تاریخ هر روز را در جدول برنامه بیاور.
10. خروجی باید مستقل و آماده نمایش به کاربر باشد؛ درباره داده خام JSON توضیح نده.

ساختار خروجی باید همیشه دقیقاً همین سه بخش و همین ترتیب را داشته باشد:

## وضعیت دانش‌آموز
- یک توضیح کوتاه و قابل فهم از وضعیت فعلی، نقاط قوت، نقاط ضعف، میزان عقب‌افتادگی و منطق کلی اولویت‌بندی.
- این بخش جدول برنامه نباشد و طولانی نشود.

## برنامه روزانه هفته
- فقط یک جدول Markdown بده.
- ستون‌های جدول باید دقیقاً این‌ها باشند: `تاریخ`، `روز`، `برنامه اصلی`، `بخش شناور جبرانی`، `مجموع ساعت`.
- برای هر روز از شنبه تا جمعه دقیقاً یک ردیف بنویس.
- در ستون `برنامه اصلی` همه پارت‌های همان روز را پشت‌سرهم بنویس و هر پارت را دقیقاً با این قالب بیاور: «بازه ساعت + نام درس + نوع کار»؛ مثلاً «۱۶:۰۰ تا ۱۷:۳۰ مطالعه فیزیک». پارت‌ها را با علامت «‹» یا « · » از هم جدا کن و همه را در همین یک سلول نگه دار (سلول جدید نساز).
- در ستون `بخش شناور جبرانی` یک بازه ساعت مشخص به همراه درس پیشنهادی برای جبران عقب‌افتادگی همان روز بنویس.
- در ستون `مجموع ساعت` جمع ساعت خالص مطالعه همان روز را بنویس.

## توصیه‌ها و آپدیت پروفایل
- 3 تا 5 توصیه کوتاه برای ادامه مسیر بده.
- دقیق بگو دانش‌آموز آخر هفته چه چیزهایی را گزارش کند تا پروفایل آپدیت شود: ساعت مطالعه واقعی، کیفیت مطالعه، درصد آزمون/تمرین، عقب‌افتادگی، و توضیح کوتاه.

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
