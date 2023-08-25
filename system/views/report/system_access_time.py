from datetime import datetime, timedelta
from collections import Counter
from django.db.models import F, Sum
from django.views.generic import ListView
from django.views.generic.edit import FormView
from django.utils.decorators import method_decorator
#from common.decorators import login_required
from system.forms import LoginTimeReportForm
from system.models import AccountAccessLog


#@method_decorator(login_required, name='dispatch')
class GetSystemAccessTime(FormView, ListView):
    template_name = 'report/get_system_access_time.html'
    model = AccountAccessLog
    form_class = LoginTimeReportForm

    def post(self, request, *args, **kwargs):
        return self.get(request, *args, **kwargs)

    def ret_queryset(self, user):
        # 기간에 일 별로 해야함
        qs = AccountAccessLog.objects.filter(
            login_time__gte=datetime.strptime(self.request.POST['start'], '%Y-%m-%d').date(),
            login_time__lte=datetime.strptime(self.request.POST['end'], '%Y-%m-%d').date()+timedelta(days=1),
            user=user
        ).values(
            'login_time'
        ).annotate(
            real_time=F('logout_time') - F('login_time')
        ).order_by('-login_time')

        return qs

    def get_queryset(self):
        if self.request.method == 'POST':
            print(self.request.POST.get('user'))

            if not self.request.POST.get('user'):
                # 전체
                qs = AccountAccessLog.objects.filter(
                    login_time__gte=datetime.strptime(self.request.POST['start'], '%Y-%m-%d').date(),
                    login_time__lte=datetime.strptime(self.request.POST['end'], '%Y-%m-%d').date()+timedelta(days=1),
                ).values(
                    'login_time'
                ).annotate(
                    real_time=F('logout_time') - F('login_time')
                ).order_by('-login_time')
            else:
                qs = self.ret_queryset(self.request.POST.get('user'))

            date_key = [t['login_time'].strftime('%Y-%m-%d') for t in qs]
            date_key = set(date_key)
            date_list = [dict(
                date=t['login_time'].strftime('%Y-%m-%d'),
                time=t['real_time']
            ) for t in qs if t['real_time']]
            
            ret_list = []
            for index, key in enumerate(date_key):
                ret_list.append(dict(date=key, time=timedelta()))
                for data in date_list:
                    if key == data['date']:
                        ret_list[index]['time'] += data['time']
               
            for li in ret_list:
                min = li['time'].days * 60 * 24
                min += int(li['time'].seconds /60)
                li['time'] = min 

            return ret_list
