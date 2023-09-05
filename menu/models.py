from django.db import models
from common.models import LogModel, TreeModel
import os

def get_project_output_path(instance, filename):
    return os.path.join('system', 'output', instance.output_type.name, filename)

# tree 분할
class Menu(TreeModel):
    title = models.CharField(max_length=100, verbose_name='제목')
    is_visible = models.BooleanField(default=True, verbose_name='메뉴표기여부')
    is_mobile_support = models.BooleanField(default=False, verbose_name='모바일 지원 여부')
    is_screen = models.BooleanField(default=False, verbose_name='화면 여부')
    user_comment = models.CharField(max_length=200, verbose_name='사용자 화면 표기용 비고', null=True, blank=True)
    screen = models.ForeignKey('menu.Screen', on_delete=models.SET_NULL, null=True, blank=True)
    url = models.URLField(max_length=200, verbose_name='url', null=True, blank=True)
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
    have_search = models.BooleanField(default=False, verbose_name='조회기능')
    have_create = models.BooleanField(default=False, verbose_name='생성기능')
    have_update = models.BooleanField(default=False, verbose_name='갱신기능')
    have_delete = models.BooleanField(default=False, verbose_name='삭제기능')
    have_upload = models.BooleanField(default=False, verbose_name='업로드기능')
    have_download = models.BooleanField(default=False, verbose_name='다운로드기능')
    comment = models.CharField(max_length=500, verbose_name='비고', null=True, blank=True)

    class Meta:
        db_table = 'screen'
        verbose_name = '화면'


class MenuFunction(LogModel):
    menu = models.ForeignKey('menu.Menu', on_delete=models.CASCADE, related_name='function_set')
    name = models.CharField(max_length=100, verbose_name='기능명')
    type_code = models.ForeignKey('base.CodeTable', on_delete=models.CASCADE, null=True, blank=True) # 시스템 - 메뉴 - 기능
    prerequisite = models.CharField(max_length=300, verbose_name='전제조건', default='', null=True, blank=True)
    description = models.CharField(max_length=500, verbose_name='설명', null=True, blank=True)

    class Meta:
        db_table = 'menu_function'
        verbose_name = '메뉴 기능'


class MenuPermissionGroup(LogModel):
    group_name = models.CharField(max_length=100, verbose_name='권한 그룹 명')
    comment = models.TextField(max_length=500, verbose_name='비고', null=True, blank=True)

    class Meta:
        db_table = 'menu_permission_group'
        verbose_name = '메뉴 권한 그룹'


class MenuPermission(LogModel):
    menu = models.ForeignKey('menu.Menu', on_delete=models.CASCADE, related_name='permission_set')
    team = models.ForeignKey('base.Team', on_delete=models.CASCADE, null=True, blank=True)
    permission_group = models.ForeignKey('menu.MenuPermissionGroup', on_delete=models.CASCADE, null=True, blank=True)
    account_type_code = models.ForeignKey('base.CodeTable', on_delete=models.CASCADE, null=True, blank=True) # 시스템 - 계정 - 계정 분류
    account = models.ForeignKey('system.Account', on_delete=models.SET_NULL, null=True, blank=True)
    search_permitted = models.BooleanField(default=False, verbose_name='조회기능')
    create_permitted = models.BooleanField(default=False, verbose_name='생성기능')
    update_permitted = models.BooleanField(default=False, verbose_name='갱신기능')
    delete_permitted = models.BooleanField(default=False, verbose_name='삭제기능')
    upload_permitted = models.BooleanField(default=False, verbose_name='업로드기능')
    download_permitted = models.BooleanField(default=False, verbose_name='다운로드기능')

    class Meta:
        db_table = 'menu_permission'
        verbose_name = '메뉴 권한'


class MenuFavorite(LogModel):
    author = models.OneToOneField('system.Account', on_delete=models.CASCADE)
    menu_id_list =  models.CharField(max_length=300, verbose_name='자주 쓰는 메뉴 ID 목록', null=True, blank=True)

    class Meta:
        db_table = 'menu_favorite'
        verbose_name = '메뉴 선호'


class ProjectOutput(LogModel):
    output_type = models.ForeignKey('base.CodeTable', on_delete=models.CASCADE)
    file = models.FileField(verbose_name='산출물', upload_to=get_project_output_path)
    class Meta:
        db_table = 'project_output'
        verbose_name = '프로젝트 산출물'

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