from base.models import CodeGroup
from common.cbvs import ApiView


class CodeGroupApiView(ApiView):
    model = CodeGroup
    duplicate_field_list = [['group_code_id', 'belonged_code_id']]
