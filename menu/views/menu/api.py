import json

from django.db.models import F, Q
from django.http import HttpResponse

from common.cbvs import ApiView
from common.functions import create_or_update_record
from menu.models import Menu, Screen


class MenuApiView(ApiView):
    model = Menu
    duplicate_field_list = [['title']]

    def post(self, request):
        params = request.POST.dict()
        params['author'] = self.request.user
        instance, message, status = create_or_update_record(params, self.model, self.duplicate_field_list,
                                                            request.FILES)
        if instance.parent is None:
            instance.root_id = instance.id
            instance.save()

        return HttpResponse(
            json.dumps({
                'message':message
            }), content_type='application/json', status=status
        )

def get_menu_excel(qs):
    import pandas as pd
    menu_df = pd.DataFrame.from_records(
        qs.values('id', 'title', 'is_screen', 'root_id', 'level', 'order'))
    menu_df['change_title'] = ''
    menu_df['change_order'] = 0
    menu_df['is_screen'] = menu_df['is_screen'].apply(lambda is_screen: '화면' if is_screen else '메뉴')
    menu_df['user_comment'] = ''
    screen_qs = Screen.objects.filter(menu__in= qs.filter(is_screen=True))
    if screen_qs.exists():
        screen_comment_dict = {group[0]:group[1] for group in screen_qs.values_list('menu_id', 'user_comment')}
        menu_df.loc[menu_df['is_screen'] == True, 'user_comment'] = menu_df.loc[menu_df['is_screen'] == True, 'id'].apply(
            lambda menu_id : screen_comment_dict[menu_id]
        )
    menu_df = menu_df.sort_values(by=['root_id','level','order'])
    menu_df = menu_df[['id','root_id','level','order','title','change_title','order','change_order','is_screen','user_comment']]
    menu_df['title'] = menu_df.apply(lambda row: row['level'] * '    '  + row['title'],axis=1)
    menu_df = menu_df.rename(columns={
        'title':'메뉴명',
        'change_title':'수정할 메뉴명',
        'is_screen':'화면or메뉴',
        'root_id':'최상단메뉴id',
        'level':'메뉴단계',
        'order':'순서',
        'change_order':'수정할 순서',
        'user_comment':'화면 표기 문구'
    })


    return menu_df

def get_menu_tree(account, user_agent):

    order_by = ['level', 'order', 'id']
    # is_mobile_support = False
    # if 'Mac' in user_agent or 'Window' in user_agent:
    #     pass
    # else:
        # is_mobile_support = True

    # qs = Menu.objects.filter(q_filter, is_mobile_support=is_mobile_support)
    qs = Menu.objects.filter(is_visible=True)
    if account.is_superuser:
        pass
    else:
        # 차후 권한 그룹 생성 으로 해당 로직 변경
        if account.teammember_set.exists() and hasattr(account, 'info') and account.info.account_type_code is not None:
            # 다 있을 경우
            # 다중 조건 : 부서 있고 나머지 없는 경우, 부서 있고 직책있는 경우, 부서 있고 직책 있고 계정 일치하는 경우, 부서 있고 계정 일치하는 경우
            #           직책 있는 경우, 직책 있고 계징 일치 하는 경우, 계정 일치하는 경우
            team_id = account.teammember_set.last().team.id
            # 재설계
            q_filters = Q()

            qs = qs.filter(
                Q(permission_set__team_id=team_id, permission_set__account=account, permission_set__account_type_code=account.info.account_type_code)
                | Q(permission_set__team_id=team_id, permission_set__account=account, permission_set__account_type_code__isnull=True)
                | Q(permission_set__team_id=team_id, permission_set__account__isnull=True, permission_set__account_type_code=account.info.account_type_code)
                | Q(permission_set__team_id=team_id, permission_set__account__isnull=True, permission_set__account_type_code=account.info.account_type_code)
                | Q(permission_set__team_id=team_id, permission_set__account__isnull=True, permission_set__account_type_code__isnull=True)
                | Q(permission_set__team__isnull=True, permission_set__account=account,permission_set__account_type_code=account.info.account_type_code)
                | Q(permission_set__team__isnull=True, permission_set__account=account, permission_set__account_type_code__isnull=True)
            )
        elif account.teammember_set.exists():
            team_id = account.teammember_set.last().team.id
            qs = qs.filter(
                Q(permission_set__team_id=team_id, permission_set__account=account, permission_set__account_type_code__isnull=True)
                | Q(permission_set__team_id=team_id, permission_set__account__isnull=True, permission_set__account_type_code__isnull=True)
                | Q(permission_set__team__isnull=True, permission_set__account=account, permission_set__account_type_code__isnull=True)
            )
        elif hasattr(account, 'info') and account.info.account_type_code is not None:
            qs = qs.filter(
                Q(permission_set__team__isnull=True, permission_set__account=account,
                  permission_set__account_type_code = account.info.account_type_code)
                | Q(permission_set__team__isnull=True, permission_set__account=account,
                    permission_set__account_type_code__isnull=True)
            )
        else:
            qs = qs.filter(permission_set__team__isnull=True,
                                     permission_set__account_type_code__isnull=True,
                                     permission_set__account=account)
    if not qs.exists():
        return None

    qs = qs.annotate(url = F('screen__url')).order_by(*order_by)
    menu_list = list()
    # tree to dict 함수
    # 해당 함수는 따로 작성
    # order list 로 담아햐 하는데 dict로 담으면 안되는데
    def tree_qs_to_dict(tree_qs, tree_list, field_list=['id', 'title', 'level', 'order', 'parent_id', 'url'], key_list = [], annotation=None):
        if annotation is not None:
            tree_qs = tree_qs.annotate(**annotation)
        for node in tree_qs:
            data_id = str(node.id)
            if data_id not in key_list:
                branch =  {field: getattr(node, field) for field in field_list}
                tree_list.append(branch)
                key_list.append(data_id)
                # 저장한다.
                if node.children_set.exists():
                    branch['children'] = list()
                    tree_qs_to_dict(node.children_set.all().order_by('order'), branch['children'], field_list, key_list, annotation)
    tree_qs_to_dict(qs, menu_list, key_list=[], annotation=dict(url = F('screen__url')))

    return menu_list










