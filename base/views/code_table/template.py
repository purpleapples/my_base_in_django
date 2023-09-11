from base.models import CodeTable
from common.cbvs import ConditionalListView
from menu.models import Menu


class CodeTableListView(ConditionalListView):
    model = CodeTable
    template_name = 'code_table/list.html'
    order_by = ['code']

    def get_queryset(self):
        qs = super().get_queryset()
        if 'parent_code' in self.kwargs.keys():
            qs = qs.filter(parent__code=self.kwargs['parent_code'])
        else:
            qs = qs.filter(level=0)
        return qs.order_by(*self.order_by)

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data()
        context['create_child'] = True
        if 'parent_code' in self.kwargs.keys():
            parent = self.model.objects.get(code=self.kwargs['parent_code'])
            context['parent'] = parent
            context['title'] = parent.name + ' 하위 '
            context['category'] = parent.category
            context['level'] = parent.level +1
            # 관리자나 등록된 화면이 아니면 link 안되도록
            if self.request.user.is_superuser:
                context['create_child'] = True
            elif Menu.objects.filter(url=self.request.path.split('?')[0]).exists():
                context['create_child'] = True
            else:
                context['create_child'] = False
        else:
            context['level'] = 0

        return context




