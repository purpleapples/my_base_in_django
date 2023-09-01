import json
from datetime import datetime

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.http import HttpResponse

from common.cbvs import ApiView
from system.models import Account, AccountInfo


class AccountApiView(ApiView):
    model = Account
    duplicate_field_list = [['username', 'name']]

    @transaction.atomic
    def post(self, request):

        params = request.POST
        model_instance = self.model()
        if  'id' in params.keys():
            # 계정 검사
            model_instance = authenticate(username=request.POST.get('username'), password=request.POST.get('current_password'))
            if model_instance is None:
                return HttpResponse(json.dumps({
                    'message':'계정 비밀번호가 다릅니다.',
                }), content_type='application/json', status=400)
            # 비밀 번호 변경 검사
            else:
                if model_instance.password == make_password(request.POST.get('password')):
                    return HttpResponse(json.dumps({
                        'message':'바꾸기 전과 동일한 비밀번호는 사용할 수 없습니다.'
                    }), content_type='applicaton/json', status=400)
            from datetime import datetime
            model_instance.update_dt = datetime.now()
        for key, value in params.items():
            if key == 'id':
                continue
            if hasattr(model_instance, key):
                setattr(model_instance, key, value)

        model_instance.is_login_checked = False
        model_instance.password = make_password(params['password'])

        # 타 계정을 함부로 건드릴 경우 본인 계정의 정보 이거나 계정 권한이 관리자 이상일 경우만 가능하도록 체크

        author = self.request.user
        # 본인이면 로그아웃 시켜버린다.

        if model_instance.id is None:
            if author.is_superuser or author.info.permission_group.group_name == '관리자':
                model_instance.save()
            else:
                return HttpResponse(
                    json.dumps(dict(message='계정 편집 권한이 없는 사용자입니다.')), content_type='application/json',status=403
                )
        else:
            if author.is_superuser or author.info.permission_group.group_name == '관리자':
                model_instance.save()
            elif model_instance.id == author.id:
                model_instance.save()
            else:
                return HttpResponse(
                    json.dumps(dict(message='계정 편집 권한이 없는 사용자입니다.')), content_type='application/json', status=403
                )

        message='저장되었습니다.'
        status = 200
        params_key = params.keys()
        if 'id' in params.keys():
            info = model_instance.info
        else:
            info = AccountInfo(account_id=model_instance.id)
        for field in ['birth_date', 'position', 'effective_date', 'phone_number', 'permission_group_id']:
            if field in params_key and params[field] != '':
                print(field)
                setattr(info, field, params[field])
        info.save()

        return HttpResponse(
            json.dumps({
                'message':message
            }), content_type='application/json', status=status
        )

def confirm_password(request):
    data = list()
    account = authenticate(username=request.POST.get('username'), password=request.POST.get('current_password'))

    if account is not None:
        data.append(1)

    return HttpResponse(json.dumps({
        'data':data
    }), content_type='application/json', status=200)

def update_password(request):

    account = authenticate(username=request.POST.get('username'), password=request.POST.get('current_password'))
    account.password = make_password(request.POST.get('password'))
    account.save(force_update=True)

    return HttpResponse(json.dumps({
        'message':'비밀 번호가 변경되었습니다.\n 다시 로그인 해주세요',
        'redirect_url':'/logout'
    }), content_type='application/json', status=200)


def force_logout(request):
    administer = request.user
    if administer.is_superuser or administer.info.permission_group.group_name == '관리자':
        account_qs = Account.objects.filter(username=json.loads(request.body.decode('UTF-8'))['username'])
        if account_qs.exists():
            account = account_qs.last()
            last_access_log = account.accountaccesslog_set.last()
            last_access_log.logout_time = datetime.now()
            last_access_log.save(force_update=True)
            account.is_login_checked = False
            account.save(force_update=True)

        return HttpResponse(json.dumps({
            'message':'사용자 로그아웃 처리 되었습니다.',
        }), content_type='application/json', status=403)
    else:
        return HttpResponse(json.dumps({
            'message':'권한이 없는 사용자 입니다.',
        }), content_type='application/json', status=403)
    # is_login_checked 만 날리고 해당 accessLog 날린다.


