from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from base.views.code_group.api import CodeGroupApiView
from base.views.code_group.template import CodeGroupListView, YearlyCodeGroupListView

from base.views.code_table.api import CodeTableApiView
from base.views.code_table.template import CodeTableListView

urlpatterns = [
    ## VIEWS

    ## CODE TABLE
    path('code-table/list/', CodeTableListView.as_view(), name='code_table_list'),
    path('code-table/api', CodeTableApiView.as_view(), name='code_table_api'),
    path('code-table/parent/<int:parent_code>/', CodeTableListView.as_view(), name='code_table_child_list'),

    ## CODE GROUP
    path('code-group/list/', CodeGroupListView.as_view(), name='code_group_list'),
    path('code-group/yearly-list/', YearlyCodeGroupListView.as_view(), name='welfare_code_group_list'),
    path('code-group/api', CodeGroupApiView.as_view(), name='code_group_api'),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
