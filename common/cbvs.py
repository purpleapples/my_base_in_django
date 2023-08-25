import json

from django.db import transaction
from django.db.models import F
from django.http import HttpResponse
from django.views import View
from django.views.generic import ListView, DetailView

from common.functions import paginate, create_or_update_record, delete_common, get_screen_comment
from common.serializer import CustomDjangoJSONEncoder
from system.models import AttachmentFile


class ConditionalListView(ListView):
    """
        listview for setting search attributes, context, queryset
    """
    search_map = dict()
    search_attributes = dict()
    non_empty_attributes = list()
    context_attributes = dict()

    order_by = list()

    order_field_list = list()
    save_record_field = list()

    def get_queryset(self):
        get_dict = self.request.GET.dict()
        # 초기값 따로 빼내야 한다.
        for key, value in self.search_map.items():
            if key in get_dict.keys():
                if get_dict[key] == '' and value in self.search_attributes.keys():
                    del self.search_attributes[value]
                    continue
                self.search_attributes[value] = get_dict[key]

                continue
            if key not in get_dict.keys() and value in self.search_attributes.keys():
                # 최초 값 삽입 방법 :
                if not self.non_empty_attributes:
                    del self.search_attributes[value]
                elif value not in self.non_empty_attributes:
                    del self.search_attributes[value]

        if 'paginate_by' in get_dict.keys():
            self.paginate_by = get_dict['paginate_by']
        if 'order_by' in get_dict.keys():
            self.order_by = get_dict['order_by'].split(',')
        if self.order_by:
            return self.model.objects.filter(**self.search_attributes).order_by(*self.order_by)
        else:
            return self.model.objects.filter(**self.search_attributes)

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data()
        for key, value in self.context_attributes.items():
            context[key] = value
        search_key = list(self.search_map.keys())
        search_values = list(self.search_map.values())
        for key, value in self.search_attributes.items():
            if key in search_values and value != '':
                context[search_key[search_values.index(key)]] = value
        if self.paginate_by:
            paginate(self, context)
            context['paginate_by'] = str(self.paginate_by)
        if len(self.order_field_list):
            context['order_field_list'] = [self.model._meta.get_field(field) for field in self.order_field_list]
        if len(self.order_by):
            order_by = dict()
            for index, field in enumerate(self.order_by):
                order_by[field] = self.model._meta.get_field(field.replace('-','')).verbose_name
            context['order_by'] = order_by
        context['screen_user_comment'] = get_screen_comment(self.request.path)
        return context

    def delete(self, request, *args, **kwargs):

        message, status = delete_common(self, self.save_record_field)

        return HttpResponse(
            json.dumps({
                'message':message
            }), content_type='application/json', status=status
        )


class ApiView(View):
    model =''
    duplicate_field_list = list()
    delete_redirect_url = ''

    def get(self, request):
        files = None
        message = ''
        status = 200
        data = None
        try:
            params = request.GET.dict()
            filter_condition = dict()
            for key, value in params.items():
                if key =='reference_values':
                    continue
                filter_condition[key] = value

            qs = self.model.objects.filter(**filter_condition)
            if 'reference_values' in params.keys():
                f_map = {f_field.replace('__', '_'):F(f_field) for f_field in params['reference_values'].split(',')}
                qs = qs.annotate(**f_map)

            if qs.exists():
                message = str(len(qs)) + '건의 데이터가 존재합니다.'
                file_qs = AttachmentFile.objects.filter(table_name=self.model._meta.db_table,
                                                        table_pk__in=list(qs.values_list('id', flat=True)))

                if 'order_by' in params.keys():
                    qs = qs.order_by(*params['order_by']).distinct()
                else:
                    qs = qs.order_by('id').distinct()

                data = list(qs.values())
                if file_qs.exists():
                    files = list(file_qs.order_by('table_pk').values())
            else:
                status = 204

        except ValueError as ve:
            data = None
            status = 303
            message = '조회값이 정확하지 않습니다. 조회 값 : ' + json.dumps(filter_condition)

        return HttpResponse(
            json.dumps({
                'data':data,
                'files':files,
                'message':message
            }, cls=CustomDjangoJSONEncoder), content_type='application/json', status=status
        )

    def post(self, request):
        params = request.POST.dict()
        params['author'] = self.request.user

        instance, message, status = create_or_update_record(params, self.model, self.duplicate_field_list, request.FILES)
        return HttpResponse(
            json.dumps({
                'message':message
            }), content_type='application/json', status=status
        )


    @transaction.atomic
    def patch(self, request):
        params = json.loads(request.body.decode('UTF-8'))
        params['author'] = self.request.user
        instance, message, status = create_or_update_record(params, self.model, self.duplicate_field_list)

        return HttpResponse(
            json.dumps({
                'message':message
            }), content_type='application/json', status=status
        )

    def head(self, request):
        filter_condition = request.GET.dict()
        data = self.model.objects.filter(**filter_condition)
        message = '데이터가 존재합니다.' if data.exists() else '데이터가 존재하지 않습니다.'
        status = 200
        return HttpResponse(
            json.dumps({
                'message':message
            }), content_type='application/json', status=status
        )

    @transaction.atomic
    def delete(self, request):

        message, status = delete_common(self)
        params = {
                'message':message
            }
        if self.delete_redirect_url != '':
            params['redirect_url'] = self.delete_redirect_url

        return HttpResponse(
            json.dumps(params), content_type='application/json', status=status
        )

    # overriding parent method in static method is not possible because of feasibility issue and the nature of super
    # @abstractmethod
    # def upload(self, request, *args, **kwargs):
    #
    #     """
    #     use file upload and Excel model
    #     :param request : must have FILES
    #     :param args: None
    #     :param kwargs: None
    #     :return: HTTPResponse
    #     """

class DetailWithAttachmentView(DetailView):

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['screen_user_comment'] = get_screen_comment(self.request.path)
        context['attachment_file_list']=AttachmentFile.objects.filter(table_name=self.model._meta.db_table, table_pk=self.object.id)
        return context
