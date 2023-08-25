import os
from datetime import datetime


from django import forms

from django.db import models



class SearchForm(forms.Form):
    search_word = forms.CharField(label='지시 번호 검색')

    def __init__(self, *args, **kwargs):
        super(SearchForm, self).__init__(*args, **kwargs)
        self.fields['search_word'].widget.attrs['style'] = "height:100px; font-size:300%"


class SingleSearchForm(forms.Form):
    search_word = forms.CharField()

    def __init__(self, *args, **kwargs):
        super(SearchForm, self).__init__(*args, **kwargs)
        self.fields['search_word'].label = kwargs['label']
        self.fields['search_word'].widget.attrs['style'] = "height:100px; font-size:300%"


def set_form_value(obj, form):
    """
    * abbr: form에서 데이터 추출 후 obj 저장
    * author: 임성혁(samson siba)
    * param: obj:model_object, form: django.forms.Form instance
    * desc:
    - 현재 데이터의 setting의 역할만 합니다.
    - 신규 foreign field 의 경우 밖에서 생성 추가필요합니다.
    - datetime의 경우 format을 %Y-%m-%d 로 잡아놓았습니다.
    - id 까지 저장함으로써 밖에서 추가 로직을 통한 속성 설정이 끝나면 save를 통해 update, save를 겸용하시면 됩니다.
    - file 의 경우는 update에서 html에 값이 들어가지 않습니다. 그러므로 변경사항이 있을 경우 다른 함수 호출해서 저장합니다.
    - 그러므로 파일은 default file setting 함수 set_files_in_model 생성
    """
    # performance test 필요

    for field in obj._meta.get_fields():
        field_type = type(field)
        if field_type in [models.ManyToOneRel, models.ManyToManyRel, models.FileField, models.ImageField]:
            continue
        field_name = field.name
        field_data = form.data.get(field_name)
        if field_data == '' or field_data is None:
            if field.null:
                field_data = None
            elif field.get_default() is not None:
                field_data = field.get_default()
        if field_type == models.DateTimeField:
            # 날짜 양식 처리

            if type(field_data) == datetime:
                setattr(obj, field_name, field_data)
            elif field_data is not None:
                setattr(obj, field_name, datetime.strptime(field_data,'%Y-%m-%d').date())
            elif field.null:
                setattr(obj, field_name, None)
        elif field_type == models.IntegerField:
            # 숫자 값 처리
            if field_data is not None and type(field_data) == int:
                setattr(obj, field_name, field_data)
        elif field_type == models.ForeignKey:
            # 외부키 처리
            if field_data != '' and field_data is not None:
                field_model =  field.related_model
                setattr(obj, field_name, field_model.objects.get(id=field_data))
        elif field_type == models.AutoField:
            if field_data == '':
                continue
        else:
            setattr(obj, field_name, field_data)


def set_files_in_model(obj, files, file_field_list = None, form = None):
    if len(files) > 0:
        for field_name in files.keys():
            files[field_name].name = os.path.basename(files[field_name].name)
            setattr(obj, field_name,  files[field_name])
            # file 삭제
            if file_field_list is not None:
                file_field_list.pop(file_field_list.index(field_name))

    if file_field_list is not None:
        for file_field in  file_field_list:
            if getattr(obj, file_field) is not None:
                if form.data.get(file_field +'_name') == '등록된 파일이 없습니다.':
                   setattr(obj, file_field, None)



def set_default_is_not_required(form_class):
    for field in ['author', 'create_dt', 'update_dt', 'delete_yn', 'use_yn', 'id']:
        if field in form_class.fields.keys():
            form_class.fields[field].required=False

