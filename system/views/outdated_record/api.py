import json
from datetime import datetime

import pandas as pd
from django.db import transaction
from django.db.models import F
from django.http import HttpResponse

from common.cbvs import ApiView
from common.serializer import CustomDjangoJSONEncoder
from system.models import OutdatedRecord, AttachmentFile


class OutdatedRecordApiView(ApiView):
	model = OutdatedRecord

	def get(self, request):
		files = None
		message = ''
		status = 200
		data = None
		try:
			params = request.GET.dict()
			filter_condition = dict()
			for key, value in params.items():
				if key == 'reference_values':
					continue
				filter_condition[key] = value

			qs = self.model.objects.filter(**filter_condition)
			if 'reference_values' in params.keys():
				f_map = {f_field.replace('__', '_'):F(f_field) for f_field in params['reference_values'].split(',')}
				qs = qs.annotate(**f_map)

			if qs.exists():
				message = str(len(qs)) + '건의 데이터가 존재합니다.'

				file_qs = AttachmentFile.objects.filter(table_name=self.model._meta.db_table,
				                                        table_pk__in=list(qs.values_list('id', flat=True)))

				if 'order_by' in params.keys():
					qs = qs.order_by(*params['order_by']).distinct()
				else:
					qs = qs.order_by('id').distinct()
				if 'fields' in params.keys():
					# dictionary key and field set field change
					df = pd.DataFrame.from_records(qs.values())
				else:
					data = list(qs.values())
				if file_qs.exists():
					files = list(file_qs.order_by('table_pk').values())
			else:
				status = 204

		except ValueError as ve:
			data = None
			status = 303
			message = '조회값이 정확하지 않습니다. 조회 값 : ' + json.dumps(filter_condition)

		return HttpResponse(
			json.dumps({
				'data':data,
				'files':files,
				'message':message
			}, cls=CustomDjangoJSONEncoder), content_type='application/json', status=status
		)

	@staticmethod
	@transaction.atomic
	def save_outdated_record(params):
		OutdatedRecordApiView.model.objects.create(**params)


	@staticmethod
	def save_outdated_record_df(table_name, author, df, save_field= []):
		# save style df list, dict
		create_dt =datetime.now()
		df = df[save_field]
		df['table'] = table_name
		df.rename(columns = {'id':'table_pk'}, inplace=True)
		save_list = zip(df['id'], df[save_field].to_dict('records'))
		OutdatedRecordApiView.model.objects.bulk_create([OutdatedRecord(table=table_name, record_pk=record_id,
		                                                                record_dict = record,
		                                                                author = author,
		                                                                create_dt=create_dt) for record_id, record in save_list],batch_size=1000)

	@staticmethod
	def get_outdated_record(table, record_pk=None):
		filter_condition = dict(table=table)
		if record_pk is not None:
			filter_condition['record_pk'] = record_pk
		return OutdatedRecord.objects.filter(**filter_condition)
