"""
리모트 개발 환경 설정입니다.
ALLOWED_HOSTS 필드를 수정 후 사용하시는걸 추천드립니다.
원격 서버에 맞게 데이터베이스 설정 또한 바꾸시면 됩니다.
"""

from main.settings.base import *
import json

DEBUG = False
# Wildcard 를 쓰기 보다는 수정하시는 것을 추천드립니다.
ALLOWED_HOSTS = ['*']

# 로컬 데이터베이스 설정을 해주시면 됩니다
CONFIG_DIR = os.path.join(BASE_DIR, '.config')
CONFIG_FILE = os.path.join(CONFIG_DIR, 'common_setting.json')

config_load = json.loads(open(CONFIG_FILE).read())

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': config_load['DB_NAME'],
        'USER' : config_load['DB_USER'],
        'PASSWORD' : config_load['DB_PASSWORD'],
        'HOST' : config_load['DB_HOST'],
        'PORT' : config_load['DB_PORT'],
    }
}

# DOCKER SETTING
'''
DATABASES = {
    "default": {
        "ENGINE": os.environ.get("SQL_ENGINE", "django.db.backends.sqlite3"),
        "NAME": os.environ.get("SQL_DATABASE", os.path.join(BASE_DIR, "db.sqlite3")),
        "USER": os.environ.get("SQL_USER", "user"),
        "PASSWORD": os.environ.get("SQL_PASSWORD", "password"),
        "HOST": os.environ.get("SQL_HOST", "localhost"),
        "PORT": os.environ.get("SQL_PORT", "5432"),
    }
}
'''

'''
# 추가로 설정이 더 필요하신 경우 아래에 추가하시면 됩니다
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="https://991b9358cfe448d0bb8d6a6dda0e07d9@o1062917.ingest.sentry.io/6053471",
    integrations=[DjangoIntegration()],

    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    traces_sample_rate=1.0,

    # If you wish to associate users to errors (assuming you are using
    # django.contrib.auth) you may enable sending PII data.
    send_default_pii=True
)
'''