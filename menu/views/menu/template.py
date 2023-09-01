import json
from django.views.generic import ListView
from base.models import Team, CodeTable
from common.cbvs import ConditionalListView
from common.models import set_pre_order_index
from common.serializer import CustomDjangoJSONEncoder
from menu.models import Menu, Screen
from system.models import Account, AttachmentFile


class MenuListView(ListView):
    template_name = 'menu/list.html'
    model = Menu

    def get_queryset(self):
        qs = self.model.objects.all().order_by('level','order')
        return qs.order_by('id')

    def get_context_data(self, *, object_list=None, **kwargs):
        context =super().get_context_data(**kwargs)
        context['tree_data'] = json.dumps(list(self.object_list.values()), cls=CustomDjangoJSONEncoder)
        context['account_list'] = Account.objects.filter(is_superuser=False).order_by('id')
        context['screen_list'] = Screen.objects.all().order_by('id')
        context['team_list'] = Team.objects.all().order_by('id')
        context['account_type_code_list'] = CodeTable.objects.filter(parent_id =CodeTable.objects.get(category='시스템', name='계정종류'))
        context['function_type_list'] = CodeTable.objects.filter(parent_id=CodeTable.objects.get(category='시스템', name='기능'))
        return context


class MenuScreenListView(ConditionalListView):
    template_name = 'menu/screen_list.html'
    model = Menu
    order_by = ['pre_order_index']
    search_map = dict(
        root='root__name',
        parent='parent__name'
    )
    search_attributes = dict(
	    is_screen=True
    )
    non_empty_attributes = ['is_screen']
    def get_queryset(self):
        qs = super().get_queryset()
        for instance in qs:
            if not instance.is_visible:
                category = instance.root.node_set.filter(level=1, id=instance.parent.parent.id).last()
                setattr(instance, 'category_title', category.title)
                setattr(instance, 'screen_title', instance.parent.title +' - ' + instance.title)
            else:
                setattr(instance, 'category_title', instance.parent.title)
                setattr(instance, 'screen_title', instance.title)
        return qs

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        set_pre_order_index(self.model)
        return context


class MenuFunctionListView(ListView):
    model = Menu
    template_name = 'menu_function/list.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data()
        context['object'] = self.model.objects.get(id=self.kwargs['pk'])
        menu = context['object']
        file_qs = AttachmentFile.objects.filter(table_name=self.model._meta.db_table, table_pk=menu.id)
        for file_type in ['guide_file', 'screen_file']:
            file = file_qs.filter(file_type='guide_file')
            if file.exists():
                context[file_type] = file.last()
        function_dict = {
            'have_search':'조회',
            'have_create':'생성',
            'have_update':'수정',
            'have_delete':'삭제',
            'have_upload':'업로드',
            'have_download':'다운로드',
        }
        function_code_name_list = list()
        screen = context['object'].screen
        for key, value in function_dict.items():
            if getattr(screen, key):
                function_code_name_list.append(value)
        context['type_code_list'] = CodeTable.objects.filter(parent__code='AMF', name__in=function_code_name_list)

        file_qs = AttachmentFile.objects.filter(table_name='menu', table_pk=self.kwargs['pk'])
        if file_qs.exists():
            for file_type in ['guide', 'image']:
                qs = file_qs.filter(file_type=file_type)
                if qs.exists():
                    context[file_type +'_file'] = qs.last()

        return context