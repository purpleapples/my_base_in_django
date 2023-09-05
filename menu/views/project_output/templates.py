from django.views.generic import ListView

from base.models import CodeTable
from menu.models import ProjectOutput

class ProjectOutputListView(ListView):
	template_name = 'project_output/list.html'
	model = ProjectOutput
	order_by =['create_dt']

	def get_context_data(self, *, object_list=None, **kwargs):
		context = super().get_context_data(**kwargs)
		context['output_type_list'] = CodeTable.objects.filter(parent__code='AO').order_by('code')
		return context




