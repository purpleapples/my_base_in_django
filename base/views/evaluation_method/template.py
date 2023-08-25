from base.models import EvaluationMethod
from common.cbvs import ConditionalListView


class EvaluationMethodListView(ConditionalListView):
	model = EvaluationMethod
	template_name = 'evaluation_method/list.html'

	def get_queryset(self):
		return super().get_queryset().order_by('id')
