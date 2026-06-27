from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0007_practice_question_metadata"),
    ]

    operations = [
        migrations.AlterField(
            model_name="quizquestion",
            name="explanation",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="quizquestion",
            name="difficulty",
            field=models.CharField(blank=True, default="", max_length=50),
        ),
    ]
