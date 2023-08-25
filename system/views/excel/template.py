from django.urls import reverse
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
		title_dict = dict(
			budget_usage_record = '예실 대비',
			income = '수익금',
			business_monthly_record = '시설',
			personal_cost='인건비',
			external_personal_cost='외부 강사료',
			guest_lecturer='외부 강사 비용',
			settlement_record='결산 내역',
			sales_benefit='영업 이자'
		)
		context['redirect_url'] = reverse(kind + '_upload')
		format_address = dict(
			budget_usage_record = 'accounting/budget-usage-record',
			business_monthly_record = 'accounting/business-monthly-record',
			income_detail='',
			personal_cost='accounting/personal-cost',
			guest_lecturer='',
			settlement_record='accounting/settlement-record',
			sales_benefit='accounting/sales-benefit',
			external_personal_cost = 'accounting/external-personal-cost'
		)
		context['title'] =title_dict[kind]
		context['upload_format'] = format_address[kind]
		return context
