from django.views.generic import ListView, TemplateView
from common.cbvs import ConditionalListView
from menu.models import Menu, MenuPermissionGroup


class MenuPermissionGroupCreateView(ListView):
	template_name = 'menu_permission_group/create.html'
	model = Menu

	def get_queryset(self):
		qs = self.model.objects.filter(is_screen=True).order_by('root_id', 'level', 'order')
		return qs.order_by('root_id','parent_id','order')

	def get_context_data(self, *, object_list=None, **kwargs):
		context = super().get_context_data(**kwargs)
		context['permission_group_list'] = MenuPermissionGroup.objects.all().order_by('id')
		return context


class MenuPermissionGroupListView(ConditionalListView):
	template_name = 'menu_permission_group/list.html'
	model = MenuPermissionGroup


class MenuPermissionGroupUpdateView(ListView):
	template_name = 'menu_permission_group/update.html'
	model = Menu

	def get_queryset(self):
		qs = self.model.objects.filter(is_screen=True).order_by('root_id', 'level', 'order')
		return qs.order_by('root_id','parent_id','order')

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		menu_permission_group = MenuPermissionGroup.objects.get(id=self.kwargs['pk'])
		context['permission_group'] = menu_permission_group
		# permission list 에 값 추가해서 보내야 한다.
		registered_permission_dict =\
			{values['menu_id']:values for values
			 in menu_permission_group.menupermission_set.all().order_by('menu__pre_order_index').values()}
		registered_menu_id_list = list(registered_permission_dict.keys())
		for instance in context['object_list']:
			is_permitted = instance.id in registered_menu_id_list
			setattr(instance, 'use', is_permitted)
			if is_permitted:
				registered_info = registered_permission_dict[instance.id]
				for attribute in ['search_permitted','create_permitted','update_permitted','delete_permitted',
				                  'upload_permitted','download_permitted']:
					setattr(instance, attribute,registered_info[attribute])
		return context
