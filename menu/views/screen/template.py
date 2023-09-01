from common.cbvs import ConditionalListView
from menu.models import Screen


class ScreenListView(ConditionalListView):
    model = Screen
    template_name = 'screen/list.html'
    search_map = dict(
	    menu_title='menu__title__iconains'
    )


    def get_queryset(self):
        qs = super().get_queryset()
        return qs.order_by('id')

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data()
        return context

