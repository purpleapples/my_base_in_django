import json

from django.db import transaction, connection
from django.http import HttpResponse

from common.cbvs import ApiView
from common.functions import create_or_update_record, subset
from menu.models import MenuPermission

api_model = MenuPermission
class MenuPermissionApiView(ApiView):
    model = MenuPermission

    def post(self, request):
        params = request.POST.dict()
        params['author'] = self.request.user
        message, status = save_menu_permission(params, self.duplicate_field_list, request.FILES)

        return HttpResponse(
            json.dumps({
                'message':message
            }), content_type='application/json', status=status
        )

@transaction.atomic
def save_menu_permission(params, duplicate_field_list, files):
    from menu.models import Menu

    menu = Menu.objects.get(id=params['menu_id'])

    combination_dict = dict()
    # 중복 검사
    combination_dict['menu_id'] = menu.id
    duplicated_qs = api_model.objects.filter(**combination_dict)
    if duplicated_qs.exists():
        if 'id' in params.keys() and params['id'] != '':
            if duplicated_qs.count > 1:
                return '이미 등록된 권한입니다.', 422  # status for unprocessable entity

    # 하위 메뉴의 경우에는 검사 후 등록 상위 메뉴 일 경우 무시
    while True:
        # 해당 menu의 root부터 실시
        condition_field_list = ['team_id', 'account_type_code_id', 'account_id']
        params['menu_id'] = menu.id
        query_str = _create_search_query(params)

        with connection.cursor() as cursor:
            cursor.execute(query_str)
            result = cursor.fetchall()
            if len(result) == 0:
                instance, message, status = create_or_update_record(params, api_model, duplicate_field_list,
                                                                    files)
            else:
                if not menu.children_set.exists():
                    return '넓은 범주의 권한이 등록되어 있습니다.\n 해당 권한 삭제 후 등록 가능합니다.', 422

        # instance, message, status = create_or_update_record(params, self.model, self.duplicate_field_list,
        #                                                     request.FILES)
        # 윗선 전부 등록
        # 최상 위 메뉴 까지 검색 후 권한 없을 경우 부여
        if menu.parent is None:
            break
        menu = menu.parent
    return instance, 200

def _create_search_query(param):

    condition_field_list = ['team_id', 'account_type_code_id', 'account_id']
    default = list()
    not_null_field_list = []
    for field in condition_field_list:
        if param[field] == '':
            default.append(field + ' is null')
        else:
            not_null_field_list.append(field)
    default = ' and '.join([condition for condition in default])

    for length in range(len(not_null_field_list)):
        # 두 분류로 추출을 진행 해서 한 부류는 값을 삽입하고 한 부류는 = null 조건을 정의한다.
        pass
    condition_list = []

    partial_condition_list = list()
    remove_field_combination_list = []
    null_field_list = [field + ' is null' for field in not_null_field_list]
    remove_field_combination_list.extend(subset(null_field_list, len(null_field_list) + 1, len(null_field_list)))

    for field in not_null_field_list:
        null_condition = field + ' is null'
        condition = field + '=' + param[field]
        partial_condition_list.append(null_condition)
        partial_condition_list.append(condition)
        remove_field_combination_list.append([null_condition, condition])

    import itertools
    # 해당 함수 제 확인 필요 : subset max_length is bigger than expected
    condition_subset = subset(partial_condition_list, len(partial_condition_list) + 1, len(not_null_field_list))
    condition_subset = list(k for k, _ in itertools.groupby(condition_subset))
    for condition in condition_subset:
        if condition in remove_field_combination_list:
            continue
        # same field count more than once must be ignored
        condition_str = '(' + ' and '.join(condition) + ')'
        is_continue = False
        for field in not_null_field_list:
            if condition_str.count(field) > 1:
                is_continue = True
                continue
        if is_continue:
            continue
        condition_list.append(condition_str)

    where = default + ' and (' + ' or '.join([condition for condition in condition_list]) + ')'

    query_str = 'select * from menu_permission where 1=1 and ' + 'menu_id = ' + str(param['menu_id']) + ' and ' + where
    return query_str
