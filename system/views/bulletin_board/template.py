from django.views.generic import TemplateView

from common.cbvs import ConditionalListView, DetailWithAttachmentView
from common.choices.system import BOARD_TYPE
from common.functions import get_screen_comment
from system.models import BulletinBoard, AttachmentFile, Account


class BulletinBoardListView(ConditionalListView):
	template_name= 'bulletin_board/list.html'
	model = BulletinBoard
	search_map = dict(
	)

	def get_queryset(self):
		from django.db.models import Q
		qs = super().get_queryset()
		# reply 를 빼고 message 중 본인이 받은 내역에 대해서만 작성한다.
		qs = qs.filter(Q(type=6, access_log__account=self.request.user)| Q(type__in=[0, 1, 2, 3, 4, 5] )).order_by('-create_dt')
		return qs.order_by('-create_dt')

	def get_context_data(self, *, object_list=None, **kwargs):
		context = super().get_context_data(**kwargs)
		return context


class BulletinBoardCreateView(TemplateView):
	template_name= 'bulletin_board/create.html'
	model = BulletinBoard

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['board_type'] = BOARD_TYPE
		context['account_list'] = Account.objects.filter(is_superuser=False).order_by('id')
		context['screen_user_comment'] = get_screen_comment(self.request.path)
		return context


class BulletinBoardDetailView(DetailWithAttachmentView):
	template_name= 'bulletin_board/detail.html'
	model = BulletinBoard

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['attachment_file_list'] = AttachmentFile.objects.filter(table_name=self.model._meta.db_table, table_pk=self.object.id)
		return context


class BulletinBoardUpdateView(TemplateView):
	template_name= 'bulletin_board/update.html'
	model= BulletinBoard

	def get_context_data(self, **kwargs):
		context= super().get_context_data(**kwargs)
		context['board_type'] = BOARD_TYPE
		context['object'] = self.model.objects.get(pk=self.kwargs['pk'])
		context['screen_user_comment'] = get_screen_comment(self.request.path)
		context['file'] = AttachmentFile.objects.filter(table_name=self.model._meta.db_table, table_pk=self.kwargs['pk'])
		return context
