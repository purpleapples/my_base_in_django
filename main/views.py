import logging
from datetime import datetime, timedelta
from django.contrib.auth import authenticate, login
from django.contrib import auth
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from django.views.generic.edit import FormView

from system.models import AccountAccessLog, IpAccessLog
from .forms import LoginForm

logger = logging.getLogger(__name__)

class HomeView(TemplateView):
    template_name='common/home.html'

class LoginView(FormView):
    template_name = 'common/login.html'
    form_class = LoginForm

    def form_valid(self, form):
        # 계정 보안
        # 로그인 하는데 사용자가 이미 로그인 한 경우
        # ip 가 동일하면 넘어간다.
        # 동일하지 않다면 이미 로그인 했다는 message 를 남긴다.
        
        ip_address = self.request.META.get('HTTP_X_REAL_IP')
        if ip_address is None:
            ip_address = '127.0.0.1'
        access_log_qs = IpAccessLog.objects.filter(access_ip=ip_address)
        if access_log_qs.exists():
            # message 띄워져야 하는데
            if access_log_qs.last().fail_count > 5:
                raise PermissionDenied('잘못된 계정 접근이 발견되었습니다.\n 해당 메시지를 처음 보신 시각 이후 30분 뒤 실시 바랍니다.')
        account = authenticate(username=form.data.get('username'), password=form.data.get('password'))

        if account is None:
            access_log_qs = IpAccessLog.objects.filter(access_ip=ip_address)
            if access_log_qs.exists():
                if access_log_qs.last().fail_count < 5:
                    access_log = access_log_qs.last()
                    access_log.fail_count +=1
                    access_log.save()
                    raise PermissionDenied('잘못된 계정 접근이 발견되었습니다. 30분 뒤 실시 바랍니다.')
            else:
                IpAccessLog.objects.create(access_ip=ip_address, create_dt=datetime.now(), fail_count=1)
                # redirect to error message page
                return super().form_valid()

        elif account is not None:
            if access_log_qs.exists():
                access_log_qs.delete()
            if not account.is_login_checked:
                login(self.request, user=account)

            else:
                if account.accountaccesslog_set.last().ipaddress != ip_address:
                    if access_log_qs.exists():
                        access_log = access_log_qs.last()
                        access_log.fail_count +=1
                        access_log.save()
                    else:
                        IpAccessLog.objects.create(access_ip=ip_address, create_dt=datetime.now(), fail_count=1)
                    raise PermissionDenied('이미 다른 장소에서 계정이 로그인 되어있습니다.\n 해당 계정을 로그아웃 하고 다시 시도바랍니다.')
                else:
                    login(self.request, user=account)

        if account.update_dt+timedelta(days=90) < datetime.now():
            return redirect('/system/account/update/'+str(account.id))

        AccountAccessLog.objects.create(
            account=account,
            login_time=datetime.now(),
            ipaddress =ip_address
        )
        account.fail_count = 0
        account.is_login_checked = True

        account.save()
        from menu.views.menu.api import get_menu_tree
        menu_list =get_menu_tree(account, self.request.META['HTTP_USER_AGENT'], 'page-dropdown')

        if menu_list is None:
            return redirect('login')

        # menu 저장 후 이용 가능하도록 설정
        # middleware 에서 재 검토
        # 권한 조회 call : team, rank_code, account
        # db 사용이 아닌 api call

        self.request.session['menu_list'] = menu_list
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('home')

def logout(request):

    if request.user.is_authenticated:
        account = request.user
        account.is_login_checked = False
        account.save()

        last = AccountAccessLog.objects.filter(account=account).last()
        last.logout_time = datetime.now()
        last.save()

        key_list = list(request.session.keys())
        for key in key_list:
            del request.session[key]

        request.session.modified = True
        auth.logout(request)

    return redirect('/')

