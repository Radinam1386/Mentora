import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

# Load environment variables (e.g. MODEL_API) so the Planning Assistant LLM
# can be reached from the planner views. We look at the repo root first, then
# the backend folder, without overriding anything already set in the shell.
load_dotenv(PROJECT_ROOT / '.env')
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY', 'django-insecure-mentora-secret-key-replace-in-production'
)

# DEBUG defaults to True for local development. In production set
# DJANGO_DEBUG=False in the .env file.
DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in {'1', 'true', 'yes'}

# Comma separated list of hosts/domains, e.g. "mentora.ir,www.mentora.ir,1.2.3.4"
ALLOWED_HOSTS = [
    'mentoralearn.ir',
    'www.mentoralearn.ir',
    '78.157.54.151',
    '127.0.0.1',
    'localhost'
]

# Domains that are trusted for CSRF-protected requests (Django admin login over
# HTTPS needs these). Provide them with scheme, e.g. "https://mentora.ir".
CSRF_TRUSTED_ORIGINS = ['http://mentoralearn.ir', 'http://www.mentoralearn.ir']


INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware'
]

ROOT_URLCONF = 'mentora.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages'
            ]
        }
    }
]

WSGI_APPLICATION = 'mentora.wsgi.application'

DATABASES = {
    'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}
}

LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = os.environ.get('DJANGO_TIME_ZONE', 'Asia/Tehran')
USE_I18N = True
USE_TZ = True

# Served under /django-static/ to avoid colliding with the React build's own
# /static/ directory (nginx serves each from a different location).
STATIC_URL = 'django-static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
CORS_ALLOW_ALL_ORIGINS = True
