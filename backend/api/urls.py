from django.urls import path
from . import views

urlpatterns = [
    path('auth/register', views.register),
    path('auth/login', views.login),
    path('auth/logout', views.logout),
    path('auth/me', views.auth_me),
    path('auth/onboarding', views.onboarding),
    path('planner/today', views.today_plan),
    path('planner/tasks/<int:task_id>', views.update_task),
    path('planner/courses', views.planning_courses),
    path('planner/weekly', views.weekly_planning),
    path('planner/plans', views.weekly_plans_list),
    path('tutor/chat', views.chat),
    path('tutor/history', views.chat_history),
    path('profile', views.profile_view),
    path('reports', views.reports),
]
