from django.db import models
from datetime import datetime

from django.db.models import Q


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


class TreeModel(models.Model):
	root = models.ForeignKey('self', related_name='node_set', on_delete=models.CASCADE, null=True, blank=True)
	parent = models.ForeignKey('self', related_name='children_set', on_delete=models.CASCADE, null=True, blank=True)
	level = models.IntegerField(default=0, verbose_name='등급')
	order = models.IntegerField(default=1, verbose_name='순서')
	pre_order_index = models.IntegerField(default=0, verbose_name='전위 순회 순서')
	access_log = models.ForeignKey('system.AccountAccessLog', null=True, blank=True, verbose_name='작성자 접속기록',
	                               on_delete=models.PROTECT,
	                               related_name='+')
	update_access_log = models.ForeignKey('system.AccountAccessLog', null=True, blank=True, verbose_name='수정자 접속 기록',
	                                      on_delete=models.PROTECT,
	                                      related_name='+')
	create_dt = models.DateTimeField(auto_now_add=True, verbose_name="생성 시간")
	update_dt = models.DateTimeField(verbose_name="수정 시간", auto_now=True)


	class Meta:
		abstract= True


def set_pre_order_index(model):
	""" 전위 순회 순서 재배정 -
	- 전위 순회 순서는 전체 데이터에 대해서 재배정해야 한다.
	- 순서는 계층별 유지 순서
	- 재귀로 시작한다.
	:param qs: level 0 instance queryset
	:return:
	"""
	if not issubclass(model, TreeModel):
		raise Exception('only TreeModel and classes inherit TreeModel are allowed !!!')
	qs = model.objects.all()
	# 참조를 위해 값은 list에 담는다.
	pre_order_index = 0
	instance_pre_order_index = {}
	def _set_pre_order_index(instance, pre_order_index):
		pre_order_index +=1
		instance_pre_order_index[instance.id] = pre_order_index
		descendant_qs =  instance.children_set.filter(level=instance.level+1)
		if descendant_qs.exists():
			for descendant in  descendant_qs.order_by('order'):
				pre_order_index = _set_pre_order_index(descendant, pre_order_index)
		return pre_order_index

	for instance in qs.filter(level=0).order_by('order'):
		pre_order_index = _set_pre_order_index(instance, pre_order_index)

	for instance in qs:
		instance.pre_order_index = instance_pre_order_index[instance.id]

	model.objects.bulk_update(qs, ['pre_order_index'], batch_size=200)