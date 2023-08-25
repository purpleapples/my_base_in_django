from django import template
register = template.Library()

@register.filter
def db_table(instance):
    return instance._meta.db_table