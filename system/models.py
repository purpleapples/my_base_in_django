
from django.db import models
from django.contrib.auth.models import AbstractUser
from common.choices.system import BOARD_TYPE
from common.models import LogModel


def get_attachment_file_path(instance, filename):
    return '/'.join([instance.table_name, str(instance.table_pk), filename])

def get_board_file_path(instance, filename):
    return '/'.join(['system','board',instance.board.id, filename])

def get_excel_path(instance,filename):
    return '/'.join(['system','excel',instance.kind, filename])


class Account(AbstractUser):
    name = models.CharField(max_length=128, verbose_name='이름')
    create_dt = models.DateTimeField(verbose_name='생성 시간', auto_now_add=True)
    update_dt = models.DateTimeField(verbose_name='수정 시간', auto_now_add=True)
    fail_count = models.IntegerField(default=0, verbose_name='실패 횟수')
    is_login_checked = models.BooleanField(default=False, verbose_name='로그인 유무')

    def __str__(self):
        return self.username +':' + self.email

    class Meta:
        db_table = 'account'
        verbose_name = '사용자'
        verbose_name_plural = '사용자'


class AccountInfo(LogModel):
    account = models.OneToOneField('system.Account', on_delete=models.CASCADE, related_name='info')
    phone_number = models.CharField(max_length=32, verbose_name='연락처', default='', blank=True)
    effective_dt = models.DateTimeField(verbose_name='급여 계산 시작일', null=True, blank=True)
    birth_dt = models.DateTimeField(verbose_name='생년월일', null=True, blank=True)
    permission_group = models.ForeignKey('menu.MenuPermissionGroup', on_delete=models.PROTECT, null=True, blank=True)
    account_type_code = models.ForeignKey('base.CodeTable', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'account_info'
        verbose_name = '사용자 정보'


class AccountAccessLog(models.Model):
    account = models.ForeignKey('system.Account', verbose_name='로그인 계정', on_delete=models.CASCADE)
    ipaddress = models.GenericIPAddressField(verbose_name='접속 IP', null=True, blank=True)
    login_time = models.DateTimeField(blank=True, null=True, verbose_name="로그인 시간")
    logout_time = models.DateTimeField(blank=True, null=True, verbose_name="로그아웃 시간")
    create_dt = models.DateTimeField(auto_now_add=True, verbose_name='생성일시', null=True, blank=True)
    update_dt = models.DateTimeField(auto_now=True, verbose_name='갱신일시', null=True, blank=True)

    class Meta:
        db_table = 'account_access_log'
        verbose_name = '사용자 접속 기록'
        verbose_name_plural = '사용자 접속 기록'


class BulletinBoardCategory(LogModel):
    type= models.CharField(max_length=100, verbose_name='종류명')
    comment = models.CharField(max_length=100, verbose_name='비고', default='', blank=True)

    class Meta:
        db_table = 'bulletin_board_type'
        verbose_name = '게시판 종류'


class BulletinBoard(LogModel):
    board_category = models.ForeignKey('system.BulletinBoardCategory', verbose_name='게시글 종류', null=True, blank=True, on_delete=models.CASCADE)
    type = models.IntegerField(choices=BOARD_TYPE, verbose_name='게시글 유형')
    title = models.CharField(max_length=100, verbose_name='제목', default='')
    content = models.TextField(max_length=2000, verbose_name='내용')
    is_delete = models.BooleanField(default=False, verbose_name='삭제여부')

    class Meta:
        db_table = 'bulletin_board'
        verbose_name = '게시글'


class AnswerRelation(LogModel):
    question = models.ForeignKey('system.BulletinBoard', on_delete=models.SET_NULL, null=True, blank=True, related_name='answer_relation')
    answer = models.ForeignKey('system.BulletinBoard', on_delete=models.SET_NULL, null=True, blank=True, related_name='question_relation')
    question_title = models.CharField(max_length=100, verbose_name='질의 제목', null=True)
    answer_title = models.CharField(max_length=100, verbose_name='답신 제목', null=True)

    class Meta:
        db_table = 'answer_relation'
        verbose_name = '답신 관계'


class ReplayRelation(LogModel):
    parent = models.ForeignKey('system.BulletinBoard', on_delete=models.CASCADE, related_name='child_relation')
    self =  models.ForeignKey('system.BulletinBoard', on_delete=models.CASCADE, related_name='parent_relation')
    level = models.IntegerField(default=0, verbose_name='글 단계')

    class Meta:
        db_table = 'replay_relation'
        verbose_name = '댓글 관계'


class Message(LogModel):
    bulletin_board = models.ForeignKey('system.BulletinBoard', on_delete=models.CASCADE)
    receiver_name = models.CharField(max_length=100, verbose_name='사용자명')
    receiver = models.ForeignKey('system.Account', on_delete=models.SET_NULL, null=True, blank=True)
    is_read = models.BooleanField(default=False, verbose_name='읽음 여부')
    read_dt = models.DateTimeField(verbose_name='읽은 시간')

    class Meta:
        db_table = 'message'
        verbose_name = '메시지'


class Excel(models.Model):
    name = models.CharField(max_length=64,verbose_name='파일이름',null=True, blank=True)
    excel_file = models.FileField(null=True, blank=True,verbose_name='엑셀파일', upload_to=get_excel_path)
    access_log = models.ForeignKey('system.AccountAccessLog', on_delete=models.PROTECT)
    upload_dt = models.DateTimeField(verbose_name="업로드 시간")
    kind = models.CharField(max_length=64,verbose_name='파일종류',null=True, blank=True)

    class Meta:
        db_table = 'excel'
        verbose_name = '엑셀파일'


class OutdatedRecord(models.Model):
    table = models.CharField(max_length=100, verbose_name='데이터 출저')
    access_log = models.ForeignKey('system.AccountAccessLog', on_delete=models.PROTECT)
    record_pk = models.IntegerField(verbose_name='아이디')
    record_dict = models.JSONField(verbose_name='이전 기록')
    access_log = models.ForeignKey('system.AccountAccessLog', on_delete=models.SET_NULL, null=True, blank=True)
    create_dt = models.DateTimeField(verbose_name='생성일시')

    class Meta:
        db_table = 'outdated_record'
        verbose_name = '이전 기록'
        verbose_name_plural = '이전 기록'


class AttachmentFile(models.Model):
    table_name = models.CharField(max_length=50, verbose_name='테이블 이름')
    table_pk = models.IntegerField(verbose_name='테이블 pk')
    file_type = models.CharField(max_length=100, verbose_name='파일 종류', null=True, blank=True)
    file = models.FileField(verbose_name= '파일', upload_to=get_attachment_file_path)
    access_log = models.ForeignKey('system.AccountAccessLog', on_delete=models.PROTECT)
    create_dt = models.DateTimeField(verbose_name='생성일시')

    @property
    def file_name(self):
        return self.file.name.split('/')[-1]

    class Meta:
        db_table = 'attachment_file'
        verbose_name = '첨부 파일'


class IpAccessLog(models.Model):
    access_ip = models.GenericIPAddressField(verbose_name='access ip')
    create_dt = models.DateTimeField(auto_now_add=True, verbose_name='first access time')
    fail_count = models.IntegerField(default=0, verbose_name='접근 실패')
    update_df = models.DateTimeField(auto_now=True, verbose_name='갱신시간')

    class Meta:
        db_table = 'ip_access_log'
        verbose_name = 'ip 접근 기록'
