import json

from django.http import HttpResponse
from django.urls import reverse
from django.views.generic import ListView

from common.functions import delete_common
from system.models import Excel


# 파일 업로드 처리 견본 CBV
class GetExcelsView(ListView):
    template_name = 'file/get_excels.html'
    model = Excel

    def get_queryset(self):
        return self.model.objects.filter(kind=self.kwargs['kind'])

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = '년도 월별 수입 파일 관리'
        return context

    def post(self,request, *args, **kwargs):

        kind = request.POST['kind']
        file = request.FILES.get('file')
        excel = self.model.objects.create(
            kind=kind,
            file=file
        )
        # 처리 함수명이 존재하면 그걸 실행한다.

        if 'process_function' in self.kwargs.keys():
            # parameter setting
            # call function
            params = self.request.POST.dict()
            params['file'] = excel
            return reverse(self.kwargs['process_function'], kwargs=params)
        else:
            return HttpResponse(
                json.dumps(
                    {
                        'message':'업로드 되었습니다.'
                    }
                ), content_type='application/json', status=200
            )

    def delete(self, request, *args, **kwargs):
        return delete_common(self)

