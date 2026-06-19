from rest_framework import serializers
from .models import User, DailyTask

class DailyTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTask
        fields = ['id', 'title', 'duration', 'is_completed', 'category']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['grade', 'major', 'target_rank', 'daily_study_hours']
