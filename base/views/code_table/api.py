import json

from django.db import transaction
from django.http import HttpResponse

from base.models import CodeTable
from base.views.yearly_code_usage.api import YearlyCodeUsageApiView
from common.cbvs import ApiView
from common.functions import create_or_update_data_frame, create_or_update_record


class CodeTableApiView(ApiView):
    model = CodeTable
    duplicate_field_list = [['code']]

    @transaction.atomic
    def post(self, request):
        params = request.POST.dict()
        params['author'] = self.request.user
        instance, message, status = create_or_update_record(params, self.model, self.duplicate_field_list,
                                                            request.FILES)
        if instance.parent is None:
            instance.root_id = instance.id
            instance.save()

        return HttpResponse(
            json.dumps({
                'message':message
            }), content_type='application/json', status=status
        )

    @staticmethod
    @transaction.atomic
    def save_hierarchical_code_list(access_log, year, parent, data_df, category, yearly_usage=False):
        # data 구성 : code, type, name
        # hierarchical structure order -> code
        target_df = data_df.sort_values('code').drop_duplicates(keep='first')
        level = parent.level +1
        target_df['category'] = category
        target_df['level'] = level
        target_df['parent_id'] = parent.id
        target_df['root_id'] = parent.root.id
        unique_row_identifier = ['code']
        result_pk_dict = create_or_update_data_frame(access_log,
                                                     CodeTable, target_df,
                                                     dict(parent_id=parent.id),
                                                     unique_row_identifier,
                                                     ['name'],
                                                     ['name'])

        if 'new_id_list' in result_pk_dict.keys():
            if yearly_usage:
                YearlyCodeUsageApiView.save_this_year_yearly_code_usage_list(
                    result_pk_dict['new_id_list'], year)