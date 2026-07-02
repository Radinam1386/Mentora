from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include, re_path
from django.views.static import serve


def serve_practice_media(request, path):
    return serve(request, path, document_root=settings.MEDIA_ROOT / 'practice_questions')


def serve_tutor_upload(request, path):
    return serve(request, path, document_root=settings.MEDIA_ROOT / 'tutor_uploads')


urlpatterns = [
    path('api/', include('api.urls')),
    re_path(
        r'^media/practice_questions/(?P<path>.*)$',
        serve_practice_media,
    ),
    re_path(
        r'^media/tutor_uploads/(?P<path>.*)$',
        serve_tutor_upload,
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
