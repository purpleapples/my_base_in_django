from django.urls import path

from menu.views.menu.api import MenuApiView
from menu.views.menu_function.api import MenuFunctionApiView
from menu.views.menu.template import MenuListView, MenuFunctionListView, MenuScreenListView
from menu.views.menu_permission.template import MenuScreenPermissionListView
from menu.views.menu_permission.api import MenuPermissionApiView
from menu.views.menu_permission_group.api import MenuPermissionGroupApiView
from menu.views.menu_permission_group.template import (
	MenuPermissionGroupCreateView,
	MenuPermissionGroupListView,
	MenuPermissionGroupUpdateView
)
from menu.views.project_output.api import ProjectOutputApiView
from menu.views.project_output.templates import ProjectOutputListView
from menu.views.screen.api import ScreenApiView
from menu.views.screen.template import ScreenListView

urlpatterns = [
	# for superuser
	path('list/', MenuListView.as_view(), name='menu_list'),
	path('api/', MenuApiView.as_view(), name='menu_api'),
	path('screen-list/', MenuScreenListView.as_view(), name='menu_screen_list'),
	path('<int:pk>/menu-function/list/', MenuFunctionListView.as_view(), name='menu_function_list'),
	path('menu-function/api', MenuFunctionApiView.as_view(), name='menu_function_api'),
	# path('menu/outputs/list/',),
	path('menu-permission/api', MenuPermissionApiView.as_view(), name='menu_permission_api'),
	path('screen/list/', ScreenListView.as_view(), name='screen_list'),
	path('screen/update/<int:pk>', MenuFunctionListView.as_view(), name='screen_update'),
	path('screen/api', ScreenApiView.as_view(), name='screen_api'),

	# for user
	#### MenuPermission
	path('menu-permission/list/', MenuScreenPermissionListView.as_view(), name='menu_permission_list'),

	path('menu-permission-group/create', MenuPermissionGroupCreateView.as_view(), name='menu_permission_group_create'),
	path('menu-permission-group/list/', MenuPermissionGroupListView.as_view(), name='menu_permission_group_list'),
	path('menu-permission-group/detail/<int:pk>', MenuPermissionGroupUpdateView.as_view(), name='menu_permission_group_update'),
	path('menu-permission-group/api', MenuPermissionGroupApiView.as_view(), name='menu_permission_group_api'),
	path('project-output/list', ProjectOutputListView.as_view(), name='project_output_list'),
	path('project-output/api', ProjectOutputApiView.as_view(), name='project_output_api')

	# path('screen/list/', ScreenListView.as_view(), name='screen_list')
]