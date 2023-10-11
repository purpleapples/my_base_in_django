import json

from django.db.models import F, Q
from django.http import HttpResponse

from common.cbvs import ApiView
from common.functions import create_or_update_record
from common.serializer import CustomDjangoJSONEncoder
from menu.models import Menu, Screen


class MenuApiView(ApiView):
    model = Menu
    duplicate_field_list = [['title']]

    def post(self, request):
        params = request.POST.dict()
        params['author'] = self.request.user
        try:
            instance, message, status = create_or_update_record(params, self.model, self.duplicate_field_list,
                                                                request.FILES, remove_old_file = True)
            if instance.parent is None:
                instance.root_id = instance.id
                instance.save()

            return HttpResponse(
                json.dumps({
                    'message':message
                }), content_type='application/json', status=status
            )
        except ValueError as ve:
            return HttpResponse(
                json.dumps(dict(message=str(ve))),
                content_type='application/json', status=400
            )
        except Exception as e:
            return HttpResponse(
                json.dumps(dict(message=str(e))),
                content_type='application/json', status=500
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

def get_menu_tree(account, user_agent, template='each-dropdown'):
    # screen 의 기능에 따라 icon의 클래스를 붙인다.

    order_by = ['root_id','pre_order_index']
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
        if hasattr(account, 'info') and account.info.permission_group is not None:
            qs = qs.filter(Q(permission_set__permission_group_id = account.info.permission_group.id))
        else:
            qs = qs.filter(permission_set__account=account)
    if not qs.exists():
        return None

    qs = qs.order_by(*order_by)
    if template == 'each-dropdown':
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
        tree_qs_to_dict(qs, menu_list, key_list=[])
        menu_list = json.dumps(list(menu_list), cls=CustomDjangoJSONEncoder)
    elif template == 'row_dropdown':
        pass
    elif template == 'page-dropdown':
        max_row = 0
        values = ['id','parent_id', 'root_id','title', 'url', 'is_screen']
        menu_pivot = list()
        menu_list = list()

        for instance in qs.filter(level=0):
            ancestor_length = instance.node_set.count()
            row = [{value:getattr(instance,value) for value in values}]
            descendent_qs = instance.node_set.filter(parent_id__isnull=False, is_visible=True)
            if descendent_qs.exists():
                # extend row with child and screen menus
                row.extend(list(descendent_qs.order_by('pre_order_index').values(*values)))
            menu_pivot.append(row)
            max_row = ancestor_length if ancestor_length > max_row else max_row
        # 새로줄
        for menu_row in menu_pivot:
            row_length = len(menu_row)
            if row_length < max_row:
                for i in range(max_row - row_length):
                    menu_row.append({value:'' for value in values})
        menu_list_length = len(menu_pivot)

        # column, row
        for i in range(0,max_row):
            rows = list()
            for j in range(0, menu_list_length):
                rows.append(menu_pivot[j][i])
            menu_list.append(rows)
        menu_list = dict(
            header=menu_list[0],
            body=menu_list[1:]
        )
    elif template == 'vertical':
        menu_list = json.dumps(list(qs.values('id', 'title', 'level', 'order', 'parent_id', 'pre_order_index','url')), cls=CustomDjangoJSONEncoder)
    return menu_list















