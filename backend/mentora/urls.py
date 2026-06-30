from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include, re_path
from django.views.static import serve

urlpatterns = [
    path('api/', include('api.urls')),
    re_path(
        r'^media/practice_questions/(?P<path>.*)$',
        serve,
        {'document_root': settings.MEDIA_ROOT / 'practice_questions'},
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
