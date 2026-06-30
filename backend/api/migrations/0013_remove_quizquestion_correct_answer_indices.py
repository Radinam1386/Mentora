from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0012_remove_quizquestion_text_subject"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="quizquestion",
            name="correct_answer_indices",
        ),
    ]
