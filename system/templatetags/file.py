from django import template
import os
register = template.Library()

@register.filter
def get_file_name(instance):
    if instance is None:
        return None
    if type(instance) != str:
        return os.path.basename(instance.name)

    return os.path.basename(instance)