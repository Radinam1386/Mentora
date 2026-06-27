# Generated manually for Mentora free trial subscriptions.

from datetime import timedelta

from django.db import migrations
from django.utils import timezone


FREE_TRIAL_DAYS = 10


def grant_free_trials(apps, schema_editor):
    User = apps.get_model("api", "User")
    UserSubscription = apps.get_model("api", "UserSubscription")

    start_date = timezone.localdate()
    end_date = start_date + timedelta(days=FREE_TRIAL_DAYS - 1)

    for user in User.objects.all():
        if UserSubscription.objects.filter(user=user).exists():
            continue

        UserSubscription.objects.create(
            user=user,
            plan=None,
            plan_name="اشتراک رایگان ۱۰ روزه",
            price=0,
            total_days=FREE_TRIAL_DAYS,
            start_date=start_date,
            end_date=end_date,
            is_active=True,
        )


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0005_subscription_models"),
    ]

    operations = [
        migrations.RunPython(grant_free_trials, migrations.RunPython.noop),
    ]
