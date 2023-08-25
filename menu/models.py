from django.db import models
from common.models import LogModel

# tree 분할
class Menu(LogModel):
    parent = models.ForeignKey('menu.Menu', related_name='children_set', on_delete=models.CASCADE, null=True, blank=True)
    root = models.ForeignKey('menu.Menu', related_name='node_set', on_delete=models.CASCADE, null=True, blank=True)
    level = models.IntegerField(default=0, verbose_name='등급')
    title = models.CharField(max_length=100, verbose_name='제목')
    order = models.IntegerField(default=1, verbose_name='순서')
    is_visible = models.BooleanField(default=True, verbose_name='메뉴표기여부')
    is_mobile_support = models.BooleanField(default=False, verbose_name='모바일 지원 여부')
    is_screen = models.BooleanField(default=False, verbose_name='화면 여부')
    user_comment = models.CharField(max_length=200, verbose_name='사용자 화면 표기용 비고', null=True, blank=True)
    screen_id = models.ForeignKey('menu.Screen', on_delete=models.SET_NULL, null=True, blank=True)
    urls = models.URLField(max_length=200, verbose_name='url', null=True, blank=True)
    description = models.CharField(max_length=500, verbose_name='설명', null=True, blank=True)

    class Meta:
        db_table = 'menu'
        verbose_name = '메뉴'

# url 관리 및 기능 관리 용
class Screen(LogModel):
    title = models.CharField(max_length=200, verbose_name='화면명', null=True, blank=True)
    url = models.URLField(max_length=200, verbose_name='url', null=True, blank=True)
    screen_file = models.FilePathField(max_length=256, verbose_name='화면파일 주소', null=True, blank=True)
    usage = models.CharField(max_length=100, verbose_name='용도', null=True, blank=True)
    is_search = models.BooleanField(default=False, verbose_name='조회기능')
    is_create = models.BooleanField(default=False, verbose_name='조회기능')
    is_update = models.BooleanField(default=False, verbose_name='조회기능')
    is_delete = models.BooleanField(default=False, verbose_name='조회기능')
    is_upload = models.BooleanField(default=False, verbose_name='조회기능')
    is_download = models.BooleanField(default=False, verbose_name='조회기능')
    comment = models.CharField(max_length=500, verbose_name='비고', null=True, blank=True)

    class Meta:
        db_table = 'screen'
        verbose_name = '화면'


class ScreenFunction(LogModel):
    screen = models.ForeignKey('menu.Screen', on_delete=models.CASCADE, related_name='function_set')
    title = models.CharField(max_length=100, verbose_name='기능명')
    type_code = models.ForeignKey('base.CodeTable', on_delete=models.CASCADE, null=True, blank=True) # 시스템 - 메뉴
    description = models.CharField(max_length=500, verbose_name='설명', null=True, blank=True)

    class Meta:
        db_table = 'screen_function'
        verbose_name = '메뉴 기능'


class MenuPermission(LogModel):
    menu = models.ForeignKey('menu.Menu', on_delete=models.CASCADE, related_name='permission_set')
    team = models.ForeignKey('base.Team', on_delete=models.CASCADE, null=True, blank=True)
    account_type_code = models.ForeignKey('base.CodeTable', on_delete=models.CASCADE, null=True, blank=True) # 시스템 - 계정 - 계정 분류
    account = models.ForeignKey('system.Account', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'menu_permission'
        verbose_name = '메뉴 권한'

# 미사용
class ScreenPermission(LogModel):
    screen = models.ForeignKey('menu.Screen', on_delete=models.CASCADE, related_name='permission_set')
    authority_type = models.ForeignKey('base.CodeTable', on_delete=models.CASCADE, null=True, blank=True, related_name='same_authority_screen_permission_set')
    team = models.ForeignKey('base.Team', on_delete=models.CASCADE, null=True, blank=True)
    rank_code = models.ForeignKey('base.CodeTable', on_delete=models.CASCADE, null=True, blank=True, related_name='same_position_screen_permission_set')
    account = models.ForeignKey('system.Account', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'screen_permission'
        verbose_name = '화면 권한'


class MenuFavorite(LogModel):
    author = models.OneToOneField('system.Account', on_delete=models.CASCADE)
    menu_id_list =  models.CharField(max_length=300, verbose_name='자주 쓰는 메뉴 ID 목록', null=True, blank=True)

    class Meta:
        db_table = 'menu_favorite'
        verbose_name = '메뉴 선호'


# class FrameworkDirectoryInformation(LogModel):
#     apps = models.CharField(max_length=400, verbose_name = 'app')
#     db_table = models.CharField(max_length=400, verbose_name = 'db_table')
#     is_generated = models.BooleanField(default=False)
#     template_directory = models.CharField(max_length=256, verbose_name='기본 프로젝트 구조 정보', null=True, blank=True)
#
#     class Meta:
#         db_table = 'framework_directory_information'
#         verbose_name='프로젝트 디렉토리 정보'


# class MenuFileInformation(LogModel):
#     menu = models.ForeignKey('menu.Menu', on_delete=models.CASCADE)
#     is_generated =