from common.cbvs import ApiView
from menu.models import ScreenFunction


class ScreenFunctionApiView(ApiView):
    model = ScreenFunction
    duplicate_field_list = [['screen_id', 'title']]

