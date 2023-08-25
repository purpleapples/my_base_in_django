import json

from django.views.generic import ListView

from system.models import OutdatedRecord

class OutdatedRecordListView(ListView):
	model = OutdatedRecord
	template_name = 'outdated_record/list.html'

	def get_queryset(self):
		return self.model.objects.filter(table=self.kwargs['table']).order_by('-create_dt')

	def get_context_data(self, *, object_list=None, **kwargs):
		context = super().get_context_data(**kwargs)
		object_list = context['object_list']
		table_map = dict(
			shipment_product = '출하 품목'
		)

		if self.kwargs['table'] in table_map.keys():
			context['title'] = table_map[self.kwargs['table']]
		if object_list:
			context['attribute_list'] = list(json.loads(object_list.first().record_dict).keys())
			for instance in object_list:
				instance.record_attribute = json.loads(instance.record_dict)

		return context


