from django.http import Http404
from base.models import CodeTable
from common.cbvs import ConditionalListView
from system.models import Excel


class ExcelListView(ConditionalListView):
	template_name = 'excel/list.html'
	model = Excel

	def get_queryset(self):
		filter_condition = dict(kind=self.kwargs['kind'])
		return self.model.objects.filter(**filter_condition).order_by('upload_dt')

	def get_context_data(self, *, object_list=None, **kwargs):
		kind = self.kwargs['kind'].replace('-','_')
		context = super().get_context_data(*kwargs)
		code_qs = CodeTable.objects.filter(code = kind)
		redirect_url_dict = {
			'hyundai-order':'sales/order-record/api/upload'
		}
		if code_qs.exists():
			code_instance = code_qs.last()
			code = code_instance.code.replace('-','_')
			context['title'] = code.name + '파일 업로드'
			context['request'] = redirect_url_dict[code]
			context['format_address'] = '/main/static/upload_format/' + code + '_format.xlsx'
			return context
		else:
			raise Http404('등록되지 않은 업로드 화면입니다.')
