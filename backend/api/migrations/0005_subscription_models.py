# Generated manually for Mentora subscription persistence.

import django.db.models.deletion
from django.db import migrations, models


DEFAULT_PLANS = [
    {
        "name": "۱ ماهه",
        "slug": "monthly",
        "duration_days": 30,
        "price": 300000,
        "highlight": False,
    },
    {
        "name": "۳ ماهه",
        "slug": "quarterly",
        "duration_days": 90,
        "price": 873000,
        "highlight": False,
    },
    {
        "name": "۶ ماهه",
        "slug": "six_months",
        "duration_days": 180,
        "price": 1710000,
        "highlight": True,
    },
    {
        "name": "۱ ساله",
        "slug": "yearly",
        "duration_days": 365,
        "price": 3240000,
        "highlight": False,
    },
]


def seed_subscription_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model("api", "SubscriptionPlan")
    for plan in DEFAULT_PLANS:
        SubscriptionPlan.objects.update_or_create(
            slug=plan["slug"],
            defaults=plan,
        )


def remove_subscription_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model("api", "SubscriptionPlan")
    SubscriptionPlan.objects.filter(slug__in=[plan["slug"] for plan in DEFAULT_PLANS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_remove_user_auth_token"),
    ]

    operations = [
        migrations.CreateModel(
            name="SubscriptionPlan",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("slug", models.CharField(max_length=50, unique=True)),
                ("duration_days", models.IntegerField()),
                ("price", models.IntegerField()),
                ("highlight", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="UserSubscription",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("plan_name", models.CharField(max_length=100)),
                ("price", models.IntegerField(default=0)),
                ("total_days", models.IntegerField(default=0)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("plan", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="api.subscriptionplan")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="subscriptions", to="api.user")),
            ],
        ),
        migrations.RunPython(seed_subscription_plans, remove_subscription_plans),
    ]
