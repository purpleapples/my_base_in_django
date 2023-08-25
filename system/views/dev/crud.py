# 개발 전용 화면
import json

from django.apps import apps
from django.core.serializers.json import DjangoJSONEncoder

from django.views.generic import TemplateView

def get_model_size(model_name):
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("select pg_size_pretty(pg_total_relation_size('" + model_name + "'));")
        row = cursor.fetchone()
        return row[0]


def get_model_field(model, selected_model_verbose_name, queryset):
    field_list = []
    is_verbose = False
    if model._meta.verbose_name == selected_model_verbose_name:
        is_verbose = True
    for field in model._meta._get_fields():
        class_name = str(field.__class__)
        if field.name == 'id':
            continue
        if 'Rel' in class_name or 'ManyToManyField' in class_name:
            field_info = dict(
                name=field.name +'_id',
                verbose_name=field.related_model._meta.verbose_name + ' ID',
                unique_values = json.dumps(list(queryset.values_list(field.name, flat=True).distinct()),
                                       cls=DjangoJSONEncoder),
                            nullable = hasattr(field, 'null'),
                                       unique_value_count = len(
                list(queryset.values_list(field.name, flat=True).distinct()))
            )
            field_list.append(field_info)
            continue
        if is_verbose:
            field_info = dict(
                name=field.name,
                verbose_name=field.verbose_name,
                unique_values=json.dumps(list(queryset.values_list(field.name, flat=True).distinct()), cls=DjangoJSONEncoder),
                nullable=hasattr(field, 'null'),
                unique_value_count=len(list(queryset.values_list(field.name, flat=True).distinct()))
            )
        else:
            field_info = dict(
                name=field.name,
                verbose_name=field.verbose_name
            )
        field_list.append(field_info)
    return field_list


class AnalysisTableDataView(TemplateView):
    template_name='dev/table_data_analysis.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # 전체 갯수, 고유값 여부, 고유 레코드 구분자, 고유값 목록
        get_dict = self.request.GET.dict()
        field_list= list()
        if 'business_table_name' not in get_dict.keys():
            app_name = 'sales'
            model_name = 'OrderRecord'
            context['business_table_name'] = '발주 기록'
        else:
            app_name = get_dict['business_table_name'].split('.')[0]
            model_name = get_dict['business_table_name'].split('.')[1]
            context['business_table_name'] = get_dict['business_table_name']
        app_list = [app_model._meta.app_label for app_model in apps.get_models() if app_model._meta.app_label not in ['auth', 'admin', 'contenttypes', 'sessions'] ]
        # .으로 연결
        app_model_dict = {app_model._meta.app_label:[] for app_model in apps.get_models() if app_model._meta.app_label not in ['auth', 'admin', 'contenttypes', 'sessions'] }
        business_app_model_list = []
        model_field_dict = dict()
        for app_model in apps.get_models():
            # model이 두번째에 있는 것 만 사용하기
            app_label = app_model._meta.app_label
            if app_label in ['auth', 'admin', 'contenttypes', 'sessions']:
                continue
            # app 별 table 구분 제거
            business_app_model_list.append((app_model._meta.app_label +'.'+ app_model._meta.object_name, app_model._meta.verbose_name))
            app_model_dict[app_label].append((app_model._meta.object_name, app_model._meta.verbose_name))
            queryset = app_model.objects.all()
            fields = get_model_field(app_model, context['business_table_name'], queryset)
            if app_model._meta.verbose_name == context['business_table_name']:
                size = get_model_size(app_model._meta.db_table)
                context['total_save_record_size'] = size
            if app_model._meta.object_name == context['business_table_name'].split('.')[-1]:
                field_list = fields
            else:
                model_field_dict[app_model._meta.verbose_name] = fields
        context['app_list'] = app_list
        context['business_app_model_list'] = business_app_model_list

        context['model_field_dict'] = json.dumps(model_field_dict, cls=DjangoJSONEncoder)
        model =apps.get_model(app_name, model_name)
        qs = model.objects.all()
        context['total_cnt'] = qs.count()
        # 목록으로  app, table 다 줄 수 있도록
        # app 목록 , model 목록 제공 해서 선택시 다른 화면 받을 수 있도록
        # context['candidate_key_list'] = candidate_key_list
        context['field_list'] = field_list
        if 'field_value' in get_dict.keys() and get_dict['field_value'] != '':
            field_name = get_dict['field_name']
            if 'date'  not in field_name and 'dt' not in field_name and '_id' not in field_name:
                field_name += '__icontains'
            context['object_list'] = qs.filter(**{field_name:get_dict['field_value']})

        return context
