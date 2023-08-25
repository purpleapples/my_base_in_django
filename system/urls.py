from django.urls import path

from .views.account.api import AccountApiView, confirm_password, force_logout
from .views.account.template import AccountCreateView, AccountListView, AccountUpdateView, PasswordUpdateAccountView
from .views.bulletin_board.api import BulletinBoardApiView
from .views.bulletin_board.template import BulletinBoardListView, BulletinBoardCreateView, BulletinBoardDetailView, \
	BulletinBoardUpdateView
from .views.dev.crud import AnalysisTableDataView
from .views.excel.api import ExcelApiView
from .views.excel.template import ExcelListView
from .views.outdated_record.api import OutdatedRecordApiView
from .views.outdated_record.template import OutdatedRecordListView

urlpatterns = [
    # VIEWS
	path('account/create/', AccountCreateView.as_view(), name='add_account'),
	path('account/list/', AccountListView.as_view(), name='get_account_list'),
	path('account/update/<int:pk>', AccountUpdateView.as_view(), name='update_account'),
	path('account/password/<int:pk>', PasswordUpdateAccountView.as_view(), name='password_update'),
	path('account/logout', force_logout),

	path('account/api', AccountApiView.as_view(), name='account_api'),
	path('account/api/password', confirm_password, name='confirm_password'),

	path('table/analysis', AnalysisTableDataView.as_view(), name='analysis_table_data'),
	path('excel/<slug:kind>/list/', ExcelListView.as_view(), name='get_excel_list'),
	path('excel/api/', ExcelApiView.as_view(), name='excel_api'),

	path('bulletin-board/list/', BulletinBoardListView.as_view(), name='bulletin_board_list'),
	path('bulletin-board/create/', BulletinBoardCreateView.as_view(), name='bulletin_board_create'),
	path('bulletin-board/detail/<slug:pk>/', BulletinBoardDetailView.as_view(), name='bulletin_board_detail'),
	path('bulletin-board/update/<slug:pk>/', BulletinBoardUpdateView.as_view(), name='bulletin_board_update'),
	path('bulletin-board/api', BulletinBoardApiView.as_view(), name='bulletin_board_api'),

	### OUTDATED_RECORD
	path('outdate-record/<slug:table>/list/', OutdatedRecordListView.as_view(), name='get_outdated_record_list'),
	path('outdated-record/api', OutdatedRecordApiView.as_view(), name='outdated_record_api')
]

