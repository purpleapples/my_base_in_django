import os

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver


# @receiver(pre_save, sender=ItemLocation)
# def equipment_pre_save(sender, instance, raw, using, update_fields, **kwargs):
# 	print(update_fields)
# 	for field in ['file1', 'file2', 'photo1', 'photo2']:
# 		if update_fields[field] is None:
# 			getattr(instance).delete()
