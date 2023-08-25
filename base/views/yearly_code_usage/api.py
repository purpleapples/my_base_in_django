from datetime import datetime

from django.http import HttpResponse
import json

from base.models import YearlyCodeUsage
from common.cbvs import ApiView


class YearlyCodeUsageApiView(ApiView):
	model = YearlyCodeUsage


	def post(self, request):
		params = request.POST
		year = params['year']
		code_id_list = json.loads(params['code_id_list'])

		access_log  = request.user.accountaccesslog_set.last()
		create_dt = datetime.now()
		self.model.objects.bulk_create( self.model(year=year, code_id=code_id, create_dt=create_dt,
		                                           access_log=access_log) for code_id in  code_id_list)

		message = str(len(code_id_list)) +' 건 저장되었습니다.'
		return HttpResponse(json.dumps({
			'message':message
		}), content_type='application/json', status=200)


	@staticmethod
	def save_this_year_yearly_code_usage_list(code_id_list, year):
		exist_code_id_list = list(set(YearlyCodeUsage.objects.filter(code_id__in=code_id_list, year=year).values_list('code_id', flat=True)))
		code_id_list = [code_id for code_id in code_id_list if code_id not in exist_code_id_list]
		YearlyCodeUsage.objects.bulk_create([YearlyCodeUsage(year=year, code_id=code_id) for code_id in code_id_list], batch_size=1000)

