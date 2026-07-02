# Generated for Mentora tutor chat sessions.

from django.db import migrations, models
import django.db.models.deletion


def migrate_existing_chat_messages(apps, schema_editor):
    ChatMessage = apps.get_model("api", "ChatMessage")
    ChatSession = apps.get_model("api", "ChatSession")

    user_ids = (
        ChatMessage.objects
        .filter(session__isnull=True)
        .order_by()
        .values_list("user_id", flat=True)
        .distinct()
    )

    for user_id in user_ids:
        session = ChatSession.objects.create(
            user_id=user_id,
            title="گفتگوی قبلی",
        )
        ChatMessage.objects.filter(user_id=user_id, session__isnull=True).update(session=session)


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0015_remove_quizquestion_question_number_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="ChatSession",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(default="گفتگوی جدید", max_length=255)),
                ("is_deleted", models.BooleanField(db_index=True, default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="chat_sessions",
                        to="api.user",
                    ),
                ),
            ],
            options={
                "ordering": ["-updated_at", "-created_at"],
            },
        ),
        migrations.AddField(
            model_name="chatmessage",
            name="metadata",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="chatmessage",
            name="session",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="messages",
                to="api.chatsession",
            ),
        ),
        migrations.AddIndex(
            model_name="chatsession",
            index=models.Index(fields=["user", "is_deleted", "updated_at"], name="api_chatses_user_id_d0822e_idx"),
        ),
        migrations.RunPython(migrate_existing_chat_messages, migrations.RunPython.noop),
    ]
