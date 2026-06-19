# Generated manually for auth and persistence

import uuid
from datetime import date

from django.db import migrations, models


def assign_unique_emails(apps, schema_editor):
    User = apps.get_model("api", "User")
    for user in User.objects.filter(email=""):
        user.email = f"legacy_{user.id}_{uuid.uuid4().hex[:8]}@mentora.local"
        user.save(update_fields=["email"])
    for user in User.objects.exclude(grade="").exclude(major=""):
        user.onboarding_completed = True
        user.save(update_fields=["onboarding_completed"])


def set_task_dates(apps, schema_editor):
    DailyTask = apps.get_model("api", "DailyTask")
    DailyTask.objects.filter(scheduled_date__isnull=True).update(scheduled_date=date.today())


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_user_bio_user_name_user_phone"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="password",
            field=models.CharField(blank=True, max_length=128),
        ),
        migrations.AddField(
            model_name="user",
            name="auth_token",
            field=models.CharField(blank=True, max_length=64, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="user",
            name="onboarding_completed",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="user",
            name="grade",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name="user",
            name="major",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name="user",
            name="target_rank",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.RunPython(assign_unique_emails, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="user",
            name="email",
            field=models.CharField(max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name="dailytask",
            name="scheduled_date",
            field=models.DateField(default=date.today),
            preserve_default=False,
        ),
        migrations.RunPython(set_task_dates, migrations.RunPython.noop),
        migrations.CreateModel(
            name="WeeklyPlan",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.TextField(blank=True)),
                ("recommendations", models.JSONField(default=list)),
                ("daily_plan", models.JSONField(default=list)),
                ("markdown", models.TextField(blank=True)),
                ("source", models.CharField(default="rule_based", max_length=50)),
                ("start_date", models.DateField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="weekly_plans", to="api.user")),
            ],
        ),
        migrations.CreateModel(
            name="ChatMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("role", models.CharField(max_length=20)),
                ("content", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="chat_messages", to="api.user")),
            ],
        ),
    ]
