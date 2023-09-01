from common.cbvs import ApiView
from menu.models import MenuFunction


class MenuFunctionApiView(ApiView):
	model = MenuFunction
	duplicate_field_list = [['menu_id', 'name', 'type_code_id']]
