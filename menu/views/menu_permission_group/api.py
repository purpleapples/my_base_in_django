import json

from django.db import transaction
from django.http import HttpResponse

from common.cbvs import ApiView
from common.functions import create_or_update_record
from menu.models import MenuPermissionGroup, MenuPermission

api_model = MenuPermissionGroup

class MenuPermissionGroupApiView(ApiView):
    model = MenuPermissionGroup
    duplicate_field_list = [['group_name']]

    def post(self, request):
        params = request.POST.dict()
        params['author'] = self.request.user
        message, status = save_menu_permission_group(params, self.duplicate_field_list, request.FILES)

        return HttpResponse(
            json.dumps({
                'message':message,
                'redirect_url':'/menu/menu-permission-group/list/'
            }), content_type='application/json', status=status
        )

@transaction.atomic
def save_menu_permission_group(params, duplicate_field_list, files):

    if 'id' in params.keys():
        MenuPermission.objects.filter(permission_group_id=params['id']).delete()

    instance_param = {key:params[key] for key in ['group_name', 'comment','author','id'] if key in params.keys()}
    instance, message, status = create_or_update_record(instance_param, api_model, duplicate_field_list,
                                                        files)
    # 만약 권한이 이미 존재하거나 업데이트 대상이라면
    menu_permission_dict_list = json.loads(params['menu_permission_list'])
    menu_id_list = [menu_permission['menu_id'] for menu_permission in menu_permission_dict_list]
    # root, parent
    from menu.models import Menu
    from datetime import datetime
    menu_qs = Menu.objects.filter(id__in=menu_id_list)
    menu_permission_list = list()
    log_dict = dict(
        create_dt = datetime.now(),
        access_log_id = params['author'].accountaccesslog_set.last().id
    )
    for attribute in ['root_id','parent_id']:
        id_list = list(set([root_id for root_id in menu_qs.values_list(attribute, flat=True).distinct()]))
        menu_permission_list.extend([MenuPermission(
            **log_dict, menu_id=menu_id, permission_group_id=instance.id
        ) for menu_id in id_list])

    menu_permission_list.extend([MenuPermission(**(log_dict |
                                                menu_permission), permission_group_id=instance.id
                                            ) for menu_permission in menu_permission_dict_list])
    MenuPermission.objects.bulk_create(menu_permission_list, batch_size=1000)
    return '저장되었습니다.', 200