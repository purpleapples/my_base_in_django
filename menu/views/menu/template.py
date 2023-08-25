import json

import pandas as pd
from django.views.generic import ListView

from base.models import Team, CodeTable
from common.serializer import CustomDjangoJSONEncoder
from menu.models import Menu, Screen
from system.models import Account


class MenuListView(ListView):
	template_name = 'menu/list.html'
	model = Menu

	def get_queryset(self):
		qs = self.model.objects.all().order_by('level','order')
		return qs.order_by('id')

	def get_context_data(self, *, object_list=None, **kwargs):
		context =super().get_context_data(**kwargs)
		context['tree_data'] = json.dumps(list(self.object_list.values()), cls=CustomDjangoJSONEncoder)
		context['account_list'] = Account.objects.filter(is_superuser=False).order_by('id')
		context['screen_list'] = Screen.objects.all().order_by('id')
		context['team_list'] = Team.objects.all().order_by('id')
		context['account_type_code_list'] = CodeTable.objects.filter(parent_id =CodeTable.objects.get(category='시스템', name='계정종류'))
		context['function_type_list'] = CodeTable.objects.filter(parent_id=CodeTable.objects.get(category='시스템', name='기능'))
		return context


