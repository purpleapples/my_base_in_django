from datetime import datetime
from .models import AccountAccessLog

def logout_processing():
    for user in AccountAccessLog.objects.all():
        if not user.logout_time:
            user.logout_time = datetime.now()
            user.save()
