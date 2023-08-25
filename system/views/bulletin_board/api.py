from common.cbvs import ApiView
from common.functions import create_or_update_record
from system.models import BulletinBoard, AnswerRelation
from django.http import HttpResponse
import json

class BulletinBoardApiView(ApiView):
    model = BulletinBoard


    def post(self, request):
        status = 200
        params = request.POST.dict()
        params['author'] = self.request.user

        if 'id' in params.keys() and params['id'] == '':
            del params['id']

        instance, message, status = create_or_update_record(params, self.model, self.duplicate_field_list,
                                                            request.FILES)

        
        if params['type'] == '4':
            if 'id' in params.keys():
                qs = AnswerRelation.objects.filter(question_id = params['question_id'], answer_id=params['id'])
                if not qs.exists():
                    AnswerRelation.objects.create(question_id = params['question_id'], answer_id=params['id'])
            else:
                AnswerRelation.objects.create(question_id=params['question_id'], answer_id=instance.id)

        return HttpResponse(
            json.dumps({
                'message':message
            }), content_type='application/json', status=status
        )



    def delete(self, request):
        message_str = ''
        status = 200
        instance = self.model.objects.filter(id=json.loads(request.body.decode('UTF-8'))['id'],
                                             access_log__account__name=request.user.name)
        if instance.exists():
            instance.delete()
            message_str = '삭제 되었습니다.'
        else:
            message_str = '삭제 할 수 있는 사용자가 아닙니다.'
            status = 401

        print('xxxx')
        return HttpResponse(
            json.dumps(dict(
                message=message_str,
                redirect_url='/system/bulletin-board/list/'
            )), content_type='application/json', status=status
        )

