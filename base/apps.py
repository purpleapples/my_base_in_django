from django.apps import AppConfig


class BaseConfig(AppConfig):
    name = 'base'
    verbose_name='기준 정보'
    def ready(self):
        import base.signals
