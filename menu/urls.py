from django.urls import path

from menu.views.menu.api import MenuApiView
from menu.views.menu_function.api import MenuFunctionApiView
from menu.views.menu.template import MenuListView
from menu.views.menu_permission.template import MenuScreenPermissionListView
from menu.views.menu_permission.api import MenuPermissionApiView
from menu.views.screen.api import ScreenApiView
from menu.views.screen.templates import ScreenListView
from menu.views.screen_function_api.api import ScreenFunctionApiView

urlpatterns = [
	# for superuser
	path('list/', MenuListView.as_view(), name='menu_list'),
	path('api/', MenuApiView.as_view(), name='menu_api'),
	path('menu-function/api', MenuFunctionApiView.as_view(), name='menu_function_api'),

	path('menu-permission/api', MenuPermissionApiView.as_view(), name='menu_permission_api'),

	path('screen/list/', ScreenListView.as_view(), name='screen_list'),
	path('screen/api', ScreenApiView.as_view(), name='screen_api'),
	path('screen-function/api', ScreenFunctionApiView.as_view(), name='screen_function_api'),

	# for user
	path('menu-permission/list/', MenuScreenPermissionListView.as_view(), name='menu_permission_list'),

	# path('screen/list/', ScreenListView.as_view(), name='screen_list')
	# url_name, accountinfo -> add permission abo ut the screen to context
]