from common.cbvs import ApiView
from menu.models import ScreenFunction


class MenuFunctionApiView(ApiView):
	model = ScreenFunction
	duplicate_field_list = [['menu_id', 'title']]
