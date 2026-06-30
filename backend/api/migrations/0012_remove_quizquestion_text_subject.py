from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0011_quizquestion_image_metadata"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="quizquestion",
            name="question_text",
        ),
        migrations.RemoveField(
            model_name="quizquestion",
            name="subject",
        ),
    ]
