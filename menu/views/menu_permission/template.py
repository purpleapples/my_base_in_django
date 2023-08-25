from base.models import CodeTable, Team
from common.cbvs import ConditionalListView
from menu.models import MenuPermission, Menu
from system.models import Account
from django.db.models import Q

class MenuScreenPermissionListView(ConditionalListView):
	template_name = 'menu_permission/screen_list.html'
	model = MenuPermission
	search_map = dict(
		menu_is_screen='menu__is_screen'
	)
	search_attributes = dict(
		menu__is_screen=True
	)
	non_empty_attributes = ['menu__is_screen']

	def get_context_data(self, *, object_list=None, **kwargs):
		context = super().get_context_data(**kwargs)
		context['team_list'] = Team.objects.all()
		context['menu_screen_list'] = Menu.objects.filter(is_screen=True)
		context['duty_code_list'] = CodeTable.objects.filter(parent = CodeTable.objects.get(name='직책')).order_by('id')
		context['account_list'] = Account.objects.filter(~Q(info__account_type_code__name='관리자'), is_superuser=False).order_by('id')

		return context