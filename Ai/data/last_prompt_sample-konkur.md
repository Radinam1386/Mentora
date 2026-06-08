شما یک مشاور تحصیلی خبره برای داوطلبان کنکور ایران هستید.
وظیفه شما تولید یک برنامه هفتگی شخصی‌سازی‌شده، قابل اجرا و قابل پیگیری است.

داده ورودی زیر شامل پروفایل دانش‌آموز، ظرفیت زمانی، وضعیت هر درس، عقب‌افتادگی، مباحث ضعیف، و تاریخچه عملکرد اخیر است:

```json
{
  "student_profile": {
    "student_id": "sample-konkur",
    "created_at": "2026-06-08T12:33:12",
    "updated_at": "2026-06-08T12:33:12",
    "student": {
      "name": "دانش‌آموز نمونه",
      "grade": "دوازدهم",
      "major": "ریاضی",
      "exam_year": "1405",
      "goal": "رساندن ریاضی و فیزیک به سطح تست زمان‌دار"
    },
    "availability": {
      "daily_hours": {
        "شنبه": 5,
        "یکشنبه": 4,
        "دوشنبه": 5,
        "سه‌شنبه": 4,
        "چهارشنبه": 5,
        "پنجشنبه": 3,
        "جمعه": 2
      },
      "weekly_hours": 28,
      "preferred_session_minutes": 90,
      "rest_minutes_between_sessions": 15,
      "constraints": [
        "جمعه سبک باشد"
      ]
    },
    "courses": {
      "حسابان": {
        "base_difficulty": 4,
        "topics": [
          "تابع",
          "مثلثات",
          "حد و پیوستگی",
          "مشتق"
        ],
        "student_weakness": 5,
        "target_importance": 5,
        "interest": 3,
        "last_test_percent": 32,
        "backlog_hours": 6.0,
        "weak_topics": [
          "تابع",
          "مشتق"
        ],
        "notes": "",
        "priority_score": 16.17,
        "recommended_weekly_hours": 6.5
      },
      "شیمی": {
        "base_difficulty": 3,
        "topics": [
          "استوکیومتری",
          "ترمودینامیک",
          "تعادل",
          "شیمی آلی"
        ],
        "student_weakness": 2,
        "target_importance": 4,
        "interest": 4,
        "last_test_percent": 68,
        "backlog_hours": 1.0,
        "weak_topics": [
          "استوکیومتری"
        ],
        "notes": "",
        "priority_score": 9.02,
        "recommended_weekly_hours": 3.5
      },
      "فیزیک": {
        "base_difficulty": 4,
        "topics": [
          "حرکت‌شناسی",
          "دینامیک",
          "الکتریسیته",
          "مغناطیس"
        ],
        "student_weakness": 4,
        "target_importance": 5,
        "interest": 4,
        "last_test_percent": 45,
        "backlog_hours": 3.0,
        "weak_topics": [
          "دینامیک"
        ],
        "notes": "",
        "priority_score": 14.06,
        "recommended_weekly_hours": 5.5
      },
      "گسسته": {
        "base_difficulty": 5,
        "topics": [
          "گراف",
          "ترکیبیات",
          "نظریه اعداد",
          "احتمال"
        ],
        "student_weakness": 3,
        "target_importance": 3,
        "interest": 2,
        "last_test_percent": 50,
        "backlog_hours": 2.0,
        "weak_topics": [
          "گراف"
        ],
        "notes": "",
        "priority_score": 12.04,
        "recommended_weekly_hours": 5.0
      },
      "هندسه": {
        "base_difficulty": 4,
        "topics": [
          "بردار",
          "مقاطع مخروطی",
          "تبدیلات",
          "هندسه فضایی"
        ],
        "student_weakness": 4,
        "target_importance": 3,
        "interest": 3,
        "last_test_percent": 42,
        "backlog_hours": 2.0,
        "weak_topics": [
          "بردار"
        ],
        "notes": "",
        "priority_score": 12.24,
        "recommended_weekly_hours": 5.0
      }
    },
    "progress_history": [],
    "planner_state": {
      "version": 1,
      "last_plan_summary": null
    }
  },
  "courses_catalog": {
    "حسابان": {
      "base_difficulty": 4,
      "weekly_hours_required": 10,
      "topics": [
        "تابع",
        "مثلثات",
        "حد و پیوستگی",
        "مشتق"
      ]
    },
    "شیمی": {
      "base_difficulty": 3,
      "weekly_hours_required": 6,
      "topics": [
        "استوکیومتری",
        "ترمودینامیک",
        "تعادل",
        "شیمی آلی"
      ]
    },
    "فیزیک": {
      "base_difficulty": 4,
      "weekly_hours_required": 8,
      "topics": [
        "حرکت‌شناسی",
        "دینامیک",
        "الکتریسیته",
        "مغناطیس"
      ]
    },
    "گسسته": {
      "base_difficulty": 5,
      "weekly_hours_required": 5,
      "topics": [
        "گراف",
        "ترکیبیات",
        "نظریه اعداد",
        "احتمال"
      ]
    },
    "هندسه": {
      "base_difficulty": 4,
      "weekly_hours_required": 5,
      "topics": [
        "بردار",
        "مقاطع مخروطی",
        "تبدیلات",
        "هندسه فضایی"
      ]
    }
  },
  "days": [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه"
  ]
}
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