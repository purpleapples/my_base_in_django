from django.db import models
from datetime import datetime


def set_default_log(model_obj, request, record_status_dict=None):
	model_obj.author_id = request.session['id']
	if model_obj.create_dt is None:
		model_obj.create_dt = datetime.now()
	model_obj.update_dt = datetime.now()

	if record_status_dict is not None:
		model_obj.delete_yn = record_status_dict['delete_yn']
		model_obj.use_yn = record_status_dict['use_yn']


class LogModel(models.Model):
	access_log = models.ForeignKey('system.AccountAccessLog', null=True, blank=True,verbose_name='작성자 접속기록', on_delete=models.PROTECT,
	                           related_name='+')
	update_access_log = models.ForeignKey('system.AccountAccessLog', null=True, blank=True,verbose_name='수정자 접속 기록', on_delete=models.PROTECT,
	                           related_name='+')
	create_dt = models.DateTimeField(auto_now_add=True, verbose_name="생성 시간")
	update_dt = models.DateTimeField(verbose_name="수정 시간", auto_now=True)
	# delete_yn = models.BooleanField(default=False, null=False, verbose_name='삭제 여부')
	# use_yn = models.BooleanField(default=True, null=True, verbose_name='사용 여부')
	# ip_address = models.GenericIPAddressField(verbose_name='ip 주소')

	class Meta:
		abstract=True
