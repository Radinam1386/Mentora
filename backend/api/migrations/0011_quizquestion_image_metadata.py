from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0010_admin_support_observability"),
    ]

    operations = [
        migrations.AlterField(
            model_name="quizquestion",
            name="question_text",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="quizquestion",
            name="question_image",
            field=models.CharField(blank=True, default="", max_length=500),
        ),
        migrations.AddField(
            model_name="quizquestion",
            name="question_number",
            field=models.IntegerField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name="quizquestion",
            name="source_page",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="quizquestion",
            name="correct_answer_indices",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
