import json
import os.path
from datetime import datetime
from django.db import transaction
from django.http import HttpResponse
from common.cbvs import ApiView
from menu.models import Screen
from system.models import Excel


class ScreenApiView(ApiView):
    model = Screen
    duplicate_field_list = [['title']]

    @staticmethod
    def upload(request, *args, **kwargs):
        message = 'upload'
        status = 200

        @transaction.atomic
        def save_file_content(request):
            create_dt = datetime.now()
            file = request.FILES.get('excel-file')
            excel = Excel.objects.create(
                excel_file=file,
                name=os.path.basename(file.name),
                kind=request.POST['kind'],
                upload_dt=create_dt.date(),
                access_log_id = request.user.accountaccesslog_set.last().id,
            )
            return str(len(1)) +'건 저장 완료되었습니다.', 200

        message, status = save_file_content(request)
        return HttpResponse(
            json.dumps({
                'message':message
            }), content_type='application/json', status=status
        )

