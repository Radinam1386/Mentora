from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0013_remove_quizquestion_correct_answer_indices"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="quizquestion",
            name="options",
        ),
    ]
