
from django.db import models
from common.models import LogModel


class Team(LogModel):
    name = models.CharField(max_length=100, verbose_name='팀명')
    child = models.ForeignKey('self', verbose_name='하위', null=True, on_delete=models.CASCADE)
    description = models.CharField(max_length=200,verbose_name='팀설명')

    class Meta:
        db_table = 'team'
        verbose_name = '팀명'


class TeamMember(LogModel):
    team = models.ForeignKey('base.Team', verbose_name='팀', on_delete=models.CASCADE)
    account = models.ForeignKey('system.Account', verbose_name='계정', on_delete=models.CASCADE)
    comment = models.CharField(max_length=100, verbose_name='비고', default='', blank=True)

    class Meta:
        db_table = 'team_member'
        verbose_name ='부서 인원'

class CodeTable(LogModel):
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children_set')
    root = models.ForeignKey('base.CodeTable', on_delete=models.CASCADE, null=True, blank=True, related_name='descendant_set')
    level = models.IntegerField(default=1, verbose_name='코드레벨')
    category = models.CharField(max_length=30, verbose_name='분류')
    type = models.CharField(max_length=30, verbose_name='타입')
    code = models.CharField(max_length=30, verbose_name='코드')
    name = models.CharField(max_length=30, verbose_name='명칭')
    description = models.CharField(max_length=100, verbose_name='설명')
    is_usage = models.BooleanField(default=True, verbose_name='사용여부')
    upload_file = models.ForeignKey('system.Excel', null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        db_table = 'code_table'
        verbose_name= '코드 테이블'


class YearlyCodeUsage(LogModel):
    year = models.IntegerField(verbose_name='년도')
    code = models.ForeignKey('base.CodeTable', on_delete=models.PROTECT)
    upload_file= models.ForeignKey('system.Excel', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'yearly_code_usage'
        verbose_name = '연별 코드 사용'


class CodeGroup(LogModel):
    year = models.IntegerField(verbose_name='연도', null=True, blank=True) # 연도별 관리를 상정 하는 경우는 optional
    group_code = models.ForeignKey('base.CodeTable', on_delete=models.CASCADE, related_name='belong_code_set')
    belonged_code = models.ForeignKey('base.CodeTable', on_delete=models.CASCADE, related_name='group_code_set')
    comment = models.TextField(max_length=500, verbose_name='비고', null=True, blank=True)

    class Meta:
        db_table = 'code_group'
        verbose_name= '코드 그룹'

