import json
import os
import pandas as pd
from django.apps import apps
from django.db.models import F
from django.http import HttpResponse
from base.models import CodeTable
from common.cbvs import ApiView
from common.functions import set_str_digit_length
from menu.models import ProjectOutput, MenuFunction
from datetime import datetime

class ProjectOutputApiView(ApiView):
    model = ProjectOutput

    def post(self, request):

        output_type = CodeTable.objects.get(code=request.POST.get('output_type_code'))

        if output_type.code == 'AO001': # database specification
            file_name, file_url = download_database_excel()
        elif output_type.code == 'AO002': # unit test case - 기능별로
            file_name, file_url = download_unit_test_case_excel()
            pass
        elif output_type.code == 'AO003': # Wireframe - 화면 파일 기능 설계서 순으로
            pass
        elif output_type.code == 'AO004': # Functional Specfication - 기능 명세서
            pass

        self.model(output_type_id=output_type.id,
                   create_dt = datetime.now(),
                   access_log_id=request.user.accountaccesslog_set.last().id,
                   file=file_url
                   )#.save()

        return HttpResponse(
            json.dumps(
                dict(
                    file_url=file_url,
                    file_name=file_name,
                )
            ), content_type='application/json', status=200
        )


def download_database_excel(app_model_dict=None, sheet_by_app=False, sheet_by_model=False):
    # project database description to excel
    ignore_app_list = ['auth', 'admin','logentry', 'contenttypes','sessions']
    ignore_model_list = ['permission','group_permissions', 'group','user','account_user_permissions','account_groups',
                         'ipaccesslog','answerrelation','replyrelation','message','account_groups', ]
    df_columns = ['table_verbose_name', 'db_name', 'column_verbose_name', 'column_variable_name', 'type', 'pk', 'fk',
                  'null', 'comment']
    file_name = datetime.now().strftime('%Y%m%d') + ' database description.xlsx'
    file_dir = './media/system/output/database/'
    os.makedirs(file_dir, exist_ok=True)
    file_url = os.path.join(file_dir, file_name)
    model_attribute_dict_list = list()
    column_map = {
        'CharField':'char(64)',
        'TextField':'char(64)',
        'EmailField':'char(32)',
        'IntegerField':'int',
        'PositiveIntegerField':'int',
        'DecimalField':'float',
        'FloatField':'float',
        'ForeignKey':'int',
        'ManyToOneRel':'int',
        'TreeForeignKey':'int',
        'CountryField':'str',
        'OneToOneField':'int',
        'BooleanField':'bool',
        'DateTimeField':'datetime',
        'DateField':'date',
        'FileField':'str',
        'ImageField':'str',
        'AutoField':'int',
        'GenericIPAddressField':'str',
        'JSONField':'json',
        'URLField':'url',
        'FilePathField':'str',
    }
    if app_model_dict is not None:
        app_list = app_model_dict.keys()
        model_list = list()
        for value in app_model_dict.values():
            model_list.extend(value)
    else:
        for app_name, value in apps.all_models.items():
            if len(value) and app_name not in ignore_app_list:
                for k, model_cls in value.items():
                    if k not in ignore_model_list:
                        db_name = model_cls._meta.db_table,
                        db_name = db_name[0]
                        table_name = model_cls._meta.verbose_name
                        for field in model_cls._meta._get_fields():
                            # help
                            class_name = str(field.__class__)
                            class_name = class_name.replace('<', '')
                            class_name = class_name.replace('>', '')
                            class_name = class_name.replace('\'', '')
                            class_name = class_name.split('.')[-1]
                            import django
                            column_verbose_name = str(getattr(field, 'verbose_name')) if hasattr(field,'verbose_name') else ''
                            if isinstance(field, django.db.models.fields.related.ForeignKey):
                                column_verbose_name = field.related_model._meta.verbose_name
                            if 'Rel' in class_name or 'ManyToManyField' in class_name:
                                continue
                            model_attribute_dict_list.append({'table_verbose_name':table_name,
                                             'db_name':db_name,
                                             'column_verbose_name':column_verbose_name,
                                             'column_variable_name':getattr(field, 'name') if hasattr(field, 'name') else '',
                                             'type':column_map[class_name],
                                             'pk':getattr(field, 'primary_key') if hasattr(field, 'primary_key') else '',
                                             'fk':class_name in ['OneToOneField', 'ForeignKey'],
                                             'null':getattr(field, 'null') if hasattr(field, 'null') else '',
                                             'comment':''})
    if len(model_attribute_dict_list):
        model_record_df = pd.DataFrame(model_attribute_dict_list)
        # openpyxl 로 전부 분할 후 움직이던가?
        model_record_df.to_excel(file_url)

    return file_name, file_url[1:]

def download_unit_test_case_excel(menu_list=None, input_column_list=None):
    """
    :desc 단위 테스트 케이스 excel 문서 생성 로직
    :param menu_dict: 단위 테스트 생성 용 메뉴 내역
    :return:
    """
    if menu_list is None:
        qs = MenuFunction.objects.all()
    else:
        qs = MenuFunction.objects.filter(menu__in=menu_list)

    if qs.count():
        qs = qs.annotate(menu_title = F('menu__title'), type_code_name=F('type_code__name'))
        # name
        # type_code
        # prerequisite
        # description
        df = pd.DataFrame.from_records(qs.values())
        df['단위 테스트ID'] = df.apply(lambda row: '-'.join(['MES', 'CD1' ,set_str_digit_length(row['menu_id'], 3)]), axis=1)

    columns_dict = dict(
        menu_title='메뉴명',
        name='단위 테스트 명',
        process='테스트 시나리오',
        success_result = '예상 결과',
    )
    # 기능 별로 숫자. 찍고 들어 가기

    df.rename(columns=columns_dict, inplace=True)
    file_name =  'Unit Test Case.xlsx'
    file_dir = './media/system/output/unit_test_case'
    os.makedirs(file_dir, exist_ok=True)
    file_url = os.path.join(file_dir, file_name)
    # 관련 model 목록
    df = df[['단위 테스트ID', '단위 테스트 명', '테스트 시나리오', '예상 결과']]
    if input_column_list is not None:
        for column in input_column_list:
            if column not in df.columns:
                df[column] = ''
        df = df[input_column_list]
    df.to_excel(file_url,header=True)
    return file_name, file_url[1:]