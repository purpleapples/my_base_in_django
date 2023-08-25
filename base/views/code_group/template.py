
from base.models import CodeGroup, CodeTable
from common.cbvs import ConditionalListView

# 일반 코드 group 관리에 대해서는 차후 생각
class CodeGroupListView(ConditionalListView):
    model = CodeGroup
    template_name = 'code_group/yearly_list.html'
    order_by = ['id']

    def get_queryset(self):
        return super().get_queryset()

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data()
        return context


class YearlyCodeGroupListView(ConditionalListView):
    model = CodeGroup
    template_name = 'code_group/yearly_list.html'
    order_by = ['id']
    search_map = dict(
        group_code_id='group_code_id'
    )
    search_attributes = dict(
        group_code_id=None
    )
    non_empty_attributes = ['group_code_id']

    def get_queryset(self):
        parent_code = self.request.path.split('/')[4]
        self.search_attributes['group_code_id'] = CodeTable.objects.get(code=parent_code).id

        return super().get_queryset()

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data()
        category = self.request.path.split('/')[3]
        context['category'] = category
        context['title'] = CodeGroup.objects.get(id=self.search_attributes['group_code_id']).name

        return context



