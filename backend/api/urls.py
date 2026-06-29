from django.urls import path
from . import views

urlpatterns = [
    path('auth/send-otp', views.send_otp),  
    path('auth/verify-otp', views.verify_otp),  
    # path('auth/register', views.register),  
    path('auth/login', views.login),
    path('auth/logout', views.logout),
    path('auth/me', views.auth_me),
    path('auth/onboarding', views.onboarding),
    path('planner/today', views.today_plan),
    path('planner/tasks', views.create_task),
    path('planner/tasks/<int:task_id>', views.update_task),
    path('planner/courses', views.planning_courses),
    path('planner/weekly', views.weekly_planning),
    path('planner/plans', views.weekly_plans_list),
    path('practice/filters', views.practice_filters),
    path('practice/questions', views.practice_questions),
    path('subscription/plans', views.subscription_plans),
    path('subscription', views.subscription_status),
    path('subscription/activate', views.activate_subscription),
    path('tutor/chat', views.chat),
    path('tutor/history', views.chat_history),
    path('profile', views.profile_view),
    path('reports', views.reports),
]