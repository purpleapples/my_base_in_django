import logging
#import imapclient

from django.urls import reverse_lazy
from django.views.generic.edit import FormView
from system.models import Account, AccountAccessLog
from system.forms import LoginForm
from common.forms import DateForm

logger = logging.getLogger(__name__)

class EmailLogin(FormView):
    template_name = 'email/login.html'
    form_class = LoginForm

    # 구글은 추가 보안 설정 필요
    # 네이버는 X
    def form_valid(self, form):
        #imap = imapclient.IMAPClient('imap.gmail.com', ssl=True)
        #imap = imapclient.IMAPClient('imap.naver.com', ssl=True)
        
        #imap.login('ppp4397@gmail.com', test)
        #imap.login(form.data.get('username'), form.data.get('password'))
        
        #pprint.pprint((imap.list_folders()))

        # gmail
        '''
        imap.select_folder('[Gmail]/전체보관함',readonly=True)
        UIDs = imap.search(['ALL'])
        raw_msg = imap.fetch([14, 200], ['BODY[]'])
        pprint.pprint(raw_msg)
        '''
        

        #if account.update_dt+timedelta(days=180) < datetime.now() :
            #return redirect('/account/password/'+str(account.id))

  
        #logger.info('vote().question.id = {}'.format(account))
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('get_account_list')
