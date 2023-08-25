import json
import logging
from django.contrib.auth.hashers import make_password
from django.http import HttpResponse
from django.views.generic import ListView, TemplateView
from django.urls import reverse_lazy

from common.cbvs import ConditionalListView
from common.functions import get_screen_comment
from system.models import Account

logger = logging.getLogger('my')


class AccountCreateView(TemplateView):
    template_name = 'account/create.html'
    success_url = reverse_lazy('get_account_list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from base.models import CodeTable
        context['account_type_code_list'] = CodeTable.objects.filter(parent__name='계정분류')
        context['screen_user_comment'] = get_screen_comment(self.request.path)
        return context


class AccountListView(ConditionalListView):
    template_name = 'account/list.html'
    model = Account
    search_map = dict()
    search_attributes = dict(
        is_superuser=False
    )
    order_by = ['-id']


class AccountUpdateView(TemplateView):
    model = Account
    template_name = 'account/update.html'
    success_url = reverse_lazy('get_account_list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object'] = self.model.objects.get(id=self.kwargs['pk'])
        from base.models import CodeTable
        context['account_type_code_list'] = CodeTable.objects.filter(parent__name='계정분류')
        context['screen_user_comment'] = get_screen_comment(self.request.path)
        return context


class PasswordUpdateAccountView(TemplateView):
    model = Account
    template_name = 'account/update_password.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object'] = self.model.objects.get(id=self.kwargs['pk'])
        context['screen_user_comment'] = get_screen_comment(self.request.path)
        return context

    def post(self, request):
        # 비번 변경은 본인 혹은 관리자만 가능하도록
        if self.request.uesr.id == self.request.POST['id'] or self.request.user.is_superuser:
            account = self.model.objects.get(id=request.POST['id'])
            if account.password == make_password(request.POST['password']):
                return HttpResponse(
                    json.dumps({
                        'message':'동일한 비밀번호는 사용할 수 없습니다.'
                    }), content_type='application/json', status=202
                )
            else:
                account.password = make_password(request.POST['password'])
                account.save(force_update=True)

            return HttpResponse(json.dumps({
                'message':'비밀번호가 변경되었습니다.\n 다시 로그인해주시길 바랍니다.',
                'redirect_url':'/logout'
            }), content_type='application/json', status=200)

        else:
            return HttpResponse(
                json.dumps({
                    'message':'비밀번호의 변경은 해당 계정 소유자 혹은 관리자만 가능합니다.'
                }), content_type='application/json', status=400
            )

  