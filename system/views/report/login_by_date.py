from datetime import datetime, timedelta
from collections import Counter
from django.db.models import F, Sum
from django.views.generic import ListView
from django.views.generic.edit import FormView
from django.utils.decorators import method_decorator
#from common.decorators import login_required
from common.forms import DateForm
from system.models import AccountAccessLog


#@method_decorator(login_required, name='dispatch')
class GetLoginByDate(FormView, ListView):
    template_name = 'report/get_login_by_date.html'
    model = AccountAccessLog
    form_class = DateForm

    def post(self, request, *args, **kwargs):
        return self.get(request, *args, **kwargs)

    def get_queryset(self):
        if self.request.method == 'POST':
            qs = AccountAccessLog.objects.filter(
                login_time__gte=datetime.strptime(self.request.POST['start'], '%Y-%m-%d').date(),
                login_time__lte=datetime.strptime(self.request.POST['end'], '%Y-%m-%d').date()+timedelta(days=1)
            ).values(
                'login_time'
            )

            date_list = [t['login_time'].strftime('%Y-%m-%d') for t in qs]
            
            cnt = Counter()
            loginList = dict()
            
            for word in date_list:
                cnt[word] += 1

            print(dict(cnt))

            loginList = []
            for li in cnt:
                login = dict(loginDate=li,cnt=cnt[li])
                loginList.append(login)
            
            print(loginList)
            return loginList
