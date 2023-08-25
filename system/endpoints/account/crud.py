import json
from django.db.models import Q, F
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.hashers import check_password, make_password
from django.views.decorators.csrf import csrf_exempt
from common.get_literal_eval import get_literal_eval
from common.mail import send
from system.models import Account


def get_random_pwd():
    """
    비밀번호 랜덤 생성 후 반환 함수
        
    Parameters
    ----------
            
    Returns
    -------
    생성된 비밀번호 반환
    """
    import string
    import random

    new_pw_len = 10 # 새 비밀번호 길이

    pw_candidate = string.ascii_letters + string.digits + string.punctuation 

    new_pw = ""
    for i in range(new_pw_len):
        new_pw += random.choice(pw_candidate)

    return new_pw


@csrf_exempt
def ChkPasswordEndpoint(request, pk):
    """
    사용자 비밀번호 확인 API
        
    Parameters
    ----------
    http-request : Object
        pk: account obj pk
        password: 확인할 패스워드
    
    Returns
    -------
    http-response : Json
    성공 or 실패 상태 반환
    """
    user = Account.objects.get(pk=pk)

    print(user.password)

    if check_password(request.POST.get('password'), user.password):
        status = 'success'
    else:
        status = 'fail'

    return HttpResponse(
        json.dumps({
        'result': status
    }), content_type='application/json')


@csrf_exempt
def ModAccountEndpoint(request, pk):
    """
    사용자 수정 API
        
    Parameters
    ----------
    http-request : Object
        pk: account obj pk
        password: 변경할 패스워드
    
    Returns
    -------
    http-response : Json
    성공 or 실패 상태 반환
    """
    user = Account.objects.get(pk=pk)

    user.password = make_password(request.POST.get('password'))
    user.save()
    
    return HttpResponse(
        json.dumps({
        'result': 'success'
    }), content_type='application/json')


@csrf_exempt
def FindAccountEndpoint(request):
    """
    사용자 아이디/비밀번호 찾기 API
        
    Parameters
    ----------
    http-request : Object
    
    Returns
    -------
    http-response : Json
    성공 or 실패 상태 반환
    """
    result = 'None'
    if request.POST.get('type') == 'id':
        if Account.objects.filter(email=request.POST.get('email')).exists():
            account_obj = Account.objects.get(email=request.POST.get('email'))

            send(
                '아이디 전송드립니다.',
                '아이디는 ' + account_obj.username  + ' 입니다.',
                account_obj.email
            )
        else:
            print('존재하지 않는 이메일입니다.')
            result = 'A'
    else:
        if Account.objects.filter(username=request.POST.get('id'),email=request.POST.get('email')).exists():
            new_pwd = get_random_pwd()
            account_obj = Account.objects.get(username=request.POST.get('id'),email=request.POST.get('email'))
            account_obj.password = make_password(new_pwd)
            account_obj.save()

            send(
                '비밀번호 전송드립니다.',
                '임시 비밀번호는 ' + new_pwd  + ' 입니다.',
                account_obj.email
            )
        else:
            print('존재하지 않는 이메일 혹은 아이디입니다.')
            result = 'B'

    return HttpResponse(
        json.dumps({
            'result': result
    }), content_type='application/json')


def GetLoginAccountEndpoint(request):
    """
    현재 로그인 된 사용자 목록 확인
        
    Parameters
    ----------
    http-request : Object
    
    Returns
    -------
    json-response : Json
    """
    return JsonResponse(list(Account.objects.filter(is_login_checked=True).values('username','type','position')), safe=False)


def get_account_list(request):
    """
        abbr :조건에 따른 account list 조회
        author : 임성혁(samson siba)
        desc : dict type 의 조건을 받아서 검색한 결과를 반환한다.
    """
    result = 'success'
    filter_condition = json.loads(request.POST.get('filter_condition'))
    values_list = json.loads(request.POST.get('values_list'))
    account_list = Account.objects.filter(**filter_condition).order_by('pk')
    if account_list == 0:
        result = 'fail'
    else:
        account_list =list(account_list.values_list('id', *values_list))
    account_list = make_dict_form_values_list(account_list)
    return HttpResponse(
        json.dumps({
            'result': result,
            'datalist' : account_list
        }), content_type='application/json')

def get_account(request):
    result = 'success'
    filter_condition = json.loads(request.POST.get('filter_condition'))
    account_list = list(Account.objects.filter(**filter_condition).order_by('pk').values_list('id'))

    return HttpResponse(
        json.dumps({
            'result': result,
            'datalist' : account_list
        }), content_type='application/json')

def make_dict_form_values_list(values_list):
    object_list = {}
    for value_tuple in values_list:
        object_list[value_tuple[0]] = value_tuple[1:]
    return object_list



