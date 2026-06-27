from django.db import migrations, models


STARTER_QUESTIONS = [
    {
        "major": "ریاضی",
        "lesson": "حسابان",
        "grade": "دوازدهم",
        "topic": "مشتق",
        "subject": "حسابان (مشتق)",
        "question_text": "اگر تابع $f(x)=\\frac{2x-1}{x+3}$ باشد، ضریب زاویه خط مماس در $x=-1$ کدام است؟",
        "options": ["$1.75$", "$1.25$", "$2.25$", "$0.75$"],
        "correct_answer_index": 0,
        "explanation": "با مشتق‌گیری از تابع کسری داریم $f'(x)=\\frac{7}{(x+3)^2}$. در $x=-1$ مقدار مشتق برابر $\\frac{7}{4}=1.75$ است.",
    },
    {
        "major": "تجربی",
        "lesson": "ریاضی",
        "grade": "دوازدهم",
        "topic": "حد و پیوستگی",
        "subject": "ریاضی (حد و پیوستگی)",
        "question_text": "حاصل $\\lim_{x \\to 2}\\frac{x^2-4}{x^2-x-2}$ کدام است؟",
        "options": ["$\\frac{4}{3}$", "$\\frac{2}{3}$", "$\\frac{5}{3}$", "$1$"],
        "correct_answer_index": 0,
        "explanation": "صورت و مخرج را تجزیه می‌کنیم: $x^2-4=(x-2)(x+2)$ و $x^2-x-2=(x-2)(x+1)$. بعد از ساده‌سازی، مقدار حد $\\frac{x+2}{x+1}$ در $x=2$ برابر $\\frac{4}{3}$ است.",
    },
    {
        "major": "مشترک",
        "lesson": "فیزیک",
        "grade": "دوازدهم",
        "topic": "حرکت‌شناسی",
        "subject": "فیزیک (حرکت‌شناسی)",
        "question_text": "در حرکت با شتاب ثابت $a=4m/s^2$ و سرعت اولیه $v_0=2m/s$، جابه‌جایی جسم در ثانیه سوم چند متر است؟",
        "options": ["۱۶ متر", "۱۲ متر", "۱۰ متر", "۱۴ متر"],
        "correct_answer_index": 1,
        "explanation": "جابه‌جایی در ثانیه nام برابر $\\Delta x_n=v_0+\\frac{a}{2}(2n-1)$ است. برای $n=3$ داریم $2+2\\times5=12$ متر.",
    },
    {
        "major": "مشترک",
        "lesson": "شیمی",
        "grade": "دوازدهم",
        "topic": "اسید و باز",
        "subject": "شیمی (اسید و باز)",
        "question_text": "اگر $[OH^-]=2\\times10^{-5}$ مولار باشد، pH محلول در دمای اتاق چقدر است؟ $\\log2=0.3$",
        "options": ["$9.3$", "$4.7$", "$8.7$", "$5.3$"],
        "correct_answer_index": 0,
        "explanation": "$pOH=-\\log[OH^-]=5-0.3=4.7$ و چون $pH+pOH=14$، مقدار pH برابر $9.3$ است.",
    },
    {
        "major": "تجربی",
        "lesson": "زیست",
        "grade": "دوازدهم",
        "topic": "گوارش",
        "subject": "زیست (گوارش)",
        "question_text": "کدام لایه دیواره لوله گوارش مستقیماً با فضای داخلی لوله در تماس است و در جذب نقش اصلی دارد؟",
        "options": ["لایه مخاطی", "لایه زیرمخاط", "لایه ماهیچه‌ای", "لایه بیرونی"],
        "correct_answer_index": 0,
        "explanation": "لایه مخاطی درونی‌ترین لایه لوله گوارش است و به دلیل تماس مستقیم با محتویات لوله، در ترشح و جذب نقش اصلی دارد.",
    },
    {
        "major": "ریاضی",
        "lesson": "گسسته",
        "grade": "دوازدهم",
        "topic": "شمارش",
        "subject": "گسسته (شمارش)",
        "question_text": "از بین ۵ نفر چند روش برای انتخاب یک گروه ۲ نفره وجود دارد؟",
        "options": ["۱۰", "۲۰", "۵", "۱۵"],
        "correct_answer_index": 0,
        "explanation": "انتخاب گروه ۲ نفره از ۵ نفر برابر ترکیب $\\binom{5}{2}=\\frac{5\\times4}{2}=10$ است.",
    },
    {
        "major": "ریاضی",
        "lesson": "آمار",
        "grade": "یازدهم",
        "topic": "میانگین",
        "subject": "آمار (میانگین)",
        "question_text": "میانگین داده‌های ۲، ۴، ۶ و ۸ برابر چند است؟",
        "options": ["۵", "۴", "۶", "۲۰"],
        "correct_answer_index": 0,
        "explanation": "جمع داده‌ها ۲۰ و تعداد داده‌ها ۴ است؛ بنابراین میانگین برابر $20\\div4=5$ می‌شود.",
    },
    {
        "major": "ریاضی",
        "lesson": "هندسه",
        "grade": "یازدهم",
        "topic": "دایره",
        "subject": "هندسه (دایره)",
        "question_text": "اگر شعاع دایره‌ای ۳ باشد، مساحت آن کدام است؟",
        "options": ["$9\\pi$", "$6\\pi$", "$3\\pi$", "$12\\pi$"],
        "correct_answer_index": 0,
        "explanation": "مساحت دایره از رابطه $A=\\pi r^2$ به‌دست می‌آید. با $r=3$ داریم $A=9\\pi$.",
    },
]


def infer_topic(subject):
    if "(" in subject and ")" in subject:
        return subject.split("(", 1)[1].split(")", 1)[0].strip()
    return subject.strip()


def backfill_question_metadata(apps, schema_editor):
    QuizQuestion = apps.get_model("api", "QuizQuestion")

    if not QuizQuestion.objects.exists():
        QuizQuestion.objects.bulk_create(
            QuizQuestion(**question) for question in STARTER_QUESTIONS
        )
        return

    for question in QuizQuestion.objects.all():
        subject = question.subject or ""
        lesson = ""
        major = "مشترک"

        if "حسابان" in subject:
            major = "ریاضی"
            lesson = "حسابان"
        elif "گسسته" in subject:
            major = "ریاضی"
            lesson = "گسسته"
        elif "آمار" in subject:
            major = "ریاضی"
            lesson = "آمار"
        elif "هندسه" in subject:
            major = "ریاضی"
            lesson = "هندسه"
        elif "زیست" in subject:
            major = "تجربی"
            lesson = "زیست"
        elif "ریاضی" in subject:
            major = "تجربی"
            lesson = "ریاضی"
        elif "شیمی" in subject:
            lesson = "شیمی"
        elif "فیزیک" in subject:
            lesson = "فیزیک"

        question.major = question.major or major
        question.lesson = question.lesson or lesson
        question.grade = question.grade or "دوازدهم"
        question.topic = question.topic or infer_topic(subject)
        question.save(update_fields=["major", "lesson", "grade", "topic"])


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0006_free_trial_subscriptions"),
    ]

    operations = [
        migrations.AddField(
            model_name="quizquestion",
            name="major",
            field=models.CharField(blank=True, db_index=True, default="", max_length=50),
        ),
        migrations.AddField(
            model_name="quizquestion",
            name="lesson",
            field=models.CharField(blank=True, db_index=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="quizquestion",
            name="grade",
            field=models.CharField(blank=True, db_index=True, default="", max_length=50),
        ),
        migrations.AddField(
            model_name="quizquestion",
            name="topic",
            field=models.CharField(blank=True, db_index=True, default="", max_length=255),
        ),
        migrations.RunPython(backfill_question_metadata, migrations.RunPython.noop),
    ]
