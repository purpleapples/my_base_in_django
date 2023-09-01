import json
from collections import OrderedDict
from datetime import datetime
import pandas as pd
from django.apps import apps
from django.db.models import Q, ProtectedError
from common.models import LogModel
from menu.models import Menu
from system.models import OutdatedRecord, AttachmentFile
from itertools import chain, combinations

# 30 are days of a month and a denominator of division
# 1/30 -> 월간 수치에 대한 일일 데이터
# data
# 일자 입력 시 일일 데이터를 이용하여 월 데이터가 꽉 찾는지 확인하고 시작 ->
# 들어오는 데이터 수치는 월 / 수치 데이터
# 해당 월별 조정 수치만 계산해서 내보낸다.

def set_outdated_record(target_df, outdated_df, qs_pk, compare_field_map):
    """  현 기록 과 이전 기록에서 이전 기록의 특정 필드에 현 기록의 특정 필드 값의 다름이 있다면 그 내역을 현 기록에 부착한다.
         부착 순서는 이전기록의 생성 순서대로
    :param target_df: 현 기록
    :param outdated_df: 이전 기록
    :param qs_pk: mapping field
    :param compare_field_map: dictionary mapping variable name and model field verbose_name
    :return:
    """
    compare_field_list = list(compare_field_map.keys())
    outdated_df = outdated_df.drop('id', axis=1)
    outdated_df['create_dt'] = outdated_df['create_dt'].apply(lambda create_dt:create_dt.strftime('%Y-%m-%d'))
    outdated_df = outdated_df.rename(columns={qs_pk:'id'})

    result = cluster_from_two_df(target_df, outdated_df, match_dtypes=True, drop_duplicate=True,
                                 concat_column=['id'], compare_field_list=['id', *compare_field_list],
                                 sort_by=['id'])
    record_df = result['different_target']
    outdated_df = result['different_control']
    # id를 index로 변경

    outdated_df = outdated_df.set_index('id')
    outdated_df.sort_values('create_dt')
    def set_changed_record_detail(row, outdated_records):
        if len(outdated_records):
            # 변경일시 : 내용 순으로 적는다.
            # 변경 기준 field
            change_records = list()
            if(isinstance(outdated_records, pd.Series) ):
                records = list()
                for field in compare_field_list:
                    if outdated_records[field] != row[field]:
                        records.append('    ' + compare_field_map[field] + ':' + outdated_records[field])
                if len(records):
                    change_record = list()
                    change_record.append('변경발생일 :' + outdated_records['create_dt'])
                    change_record.extend(records)
                    change_records.append('\n'.join(change_record))
            else:
                for record in  outdated_records[[*compare_field_list, 'create_dt']].to_dict('records'):
                    records = list()
                    for field in compare_field_list:
                        if record[field] != row[field]:
                            records.append('    '+compare_field_map[field] +':' + record[field])
                    if len(records):
                        change_record = list()
                        change_record.append('변경발생일 :'+ record['create_dt'])
                        change_record.extend(records)
                        change_records.append('\n'.join(change_record))
                return '\n'.join(change_records)
        else:
            return None
    record_df['changed_record_detail'] = record_df.apply(
        lambda row: set_changed_record_detail(row, outdated_df.loc[row['id'],:]), axis=1)
    return record_df

def path_converter_to_regex(path):
    pass
    # api 요청이 아닌 경우 그리고
    # 해당 Path 가 들어올 경우 일치 데이터가 없는 경우 실시
    # similar 를 이용해서 일치도를 분석후 regex를 이용한 이차 분석
    # 등록된 모든 url 중 path 에 맞


def get_queryset_from_one_of_condition(model, pre_defined, params, field_list):
    condition_list = []
    for field in field_list:
        if field in params.keys() and params[field] != '':
            condition_list.append(field + '=' + str(params[field]))

    from django.db import connection
    with connection.cursor() as cursor:
        where = '(' + ' or '.join(['(' + condition + ')' for condition in condition_list]) + ')'
        cursor.execute(pre_defined + where)
        result = cursor.fetchall()
        if len(result):
            qs = model.objects.filter(
                id__in= [group[0] for group in result])
        else:
            return model.objects.none()
    return qs

def check_date_list_in_another_date_list(date_list, compare_date_list, date_format):
    compare_type = ''
    # 시간 데이터 비교 방법
    # 시간 데이터 길이를 바탕으로 비교 : 시간 데이터가 범위 값이 아닐 경우
    # 범위간 비교 : 시간 데이터가 10자가 넘을 경우
    #
    # 종류 다섯 가지 yyyy, yyyy-mm-dd~yyyy-mm-dd
    # 등록 시도 날짜 데이터 형식 검증
    for date_split in date_list.split(','):
        date_length = len(date_split)
        if date_length == 10:
            compare_type = 'date'
        elif date_length == 21:
            compare_type = 'date_range'
            date_range = date_split.split('~')
            start_date = date_range[0]
            end_date = date_range[1]
            if '01-01' in start_date[4:] and '12-31' in end_date[4:]:
                return '해당 년도에 일정 기간의 조정 기록이 등록되었습니다. 삭제 후 진행 바랍니다.', 400
            start_date = datetime.strptime(start_date, date_format).date()
            end_date = datetime.strptime(end_date, date_format).date()

        # 기등록 데이터 날짜 범주 포함 여부 확인
        for compare_date in compare_date_list:
            for date_str in compare_date.split(','):
                date_length = len(date_str)
                if date_length == 10:
                    if compare_type == 'date_range':
                        date_range = date_split.split('~')
                        compared_date = datetime.strptime(date_str, date_format).date()
                        compare_start_date = datetime.strptime(date_range[0], date_format).date()
                        compare_end_date = datetime.strptime(date_range[1], date_format).date()
                        if start_date <= compared_date <= end_date:
                            return '이미 등록된 기간이 존재합니다.', 400
                    # 등록 데이터가 월, 월범위, 일 범위일 경우
                elif date_length == 21:
                    date_range = date_str.split('~')
                    start_date = date_range[0]
                    end_date = date_range[1]
                    if '01-01' in start_date[4:] and '12-31' in end_date[4:]:
                        return '해당 년도에 일정 기간의 조정 기록이 등록되었습니다. 삭제 후 진행 바랍니다.', 400
                    start_date = datetime.strptime(start_date, date_format).date()
                    end_date = datetime.strptime(end_date, date_format).date()
                    date_range = date_split.split('~')
                    compare_start_date = datetime.strptime(date_range[0], date_format).date()
                    compare_end_date = datetime.strptime(date_range[1], date_format).date()

                    if (start_date <= compare_start_date <= end_date) or \
                            (start_date <= compare_end_date <= end_date):
                        return '이미 등록된 조정 기간 범위에 겹칩니다. \n 확인 후 등록 바랍니다.', 400

                    # 등록 데이터가 월, 월범위, 일 범위일 경우
                # 한건 이라도 범위가 포함된 경우가 있다면 바로 튕겨낸다.
    return '겹치는 범위가 없습니다.', 200


def get_adjustment_figure(df, adjustment_df):
    """ 시설 공단 기준 한달 : 30일. 월 수치의 1/30을 하루의 수치로 계산한다.
    조정액 dataframe 구성 방법
    조정 대상 df 구성 : business_id, month, amount, employee_id, expenditure_code_id | budget_code_id | section | part 로 구성 된다.
    record type 별 : budget_usage_record => business_id, budget_code_id
                    personal_cost => business_id, employee_id, personal_cost_code_id
                    business_monthly_record => business_id, section_id, part
    # 조정의 경우 이력 데이터는 무조건 한달치 데이터를 만들고 시작해야한다.
    # 조정 df 구성 year, date_list, title, reason,
    adjustment_type_code 별 : budget_usage_record => business_id, budget_code_id
                             personal_cost => business_id, employee_id, personal_cost_code_id
                             business_monthly_record => business_id, facility_id, program_id
    # 0. 일단 컬럼을 맞추고
    # 1. 일단 조정 일자 데이터를 먼저 변경 시킨다.
    # 2. 각 컬럼의 데이터가 일치하는 부분에서 일자 count 해서 조정액 제외한다.

    년일 경우 모든 수치를 조정액으로 전환한다.
    월일 경우 수치 *  해당 월 조정일 수 / 30 의 수치를 조정액으로 잡는다.
    - 인건비의 경우: 개별 인건비의 경우 주 15시간 밑으로 계산될 경우 주휴수당도 빼서 계산해야되는지?
        인건비 계산 시 : 인건비 액수의 경우 각 인원 별 월별 과세 총액 합산을 월 인건비로 잡는다.
                      이후 개인 혹은 사업별 세부 인건비 항목에 대한 조정을 제외한다.
                      이 때 인건비 조정 내역 중 세부항목 공통 조정의 경우 금액을 따로 산정 해야 한다.

    :param date_dict{dict}: key:year|month, value: list{date}
    :param df{pandas.DataFrame} : 월, 수치가 들어간 dataframe
    """
    # 1. 예산 기록 기준


    # 조정 먼저 들어가고
    #

    # 조정 일자 계산 방법: 30 ->


def subset(iterable,  max_length, start=1, step=1):
    return [list(element) for element in  list(chain.from_iterable(combinations(iterable, r) for r in  range(start, max_length, step)))]

def change_date_str_list_to_df(date_str_list, include_range=False):
    # adjustment to df 로 변경해야한다.
    #
    date_list_split = date_str_list.split(',')
    date_df = pd.DataFrame({'date_str':date_list_split} )
    # 년도일 경우 : 년도 그대로
    # 일일 경우 : 일 그대로


# 폐기
def date_str_list_to_date_list(date_str_list, include_range = False, range_to=dict(
    year='year',
    year_month='month',
    month='month',
    year_month_date='date',
    month_date='date',
    date='date'
)):
    # if a date_str including time format must be excluded
    # range_to must be the one of 'year','month', 'date'
    # values must include a special character as seperator

    import re
    from datetime import timedelta
    result = []
    date_format = dict(
        year={
            '\d{4}':'%Y',
            '\d{2}':'%y'
        },
        month={
            '\d{4}-\d{2}':'%Y-%m',
            '\d{4}\.\d{2}':'%Y.%m',
            '\d{4}\/\d{2}':'%Y/%d',
            '\d{2}-\d{2}':'%y-%m',
            '\d{2}\.\d{2}':'%y.%m',
            '\d{2}\/\d{2}':'%y/%m',
        },
        date={
            '\d{4}-\d{2}-\d{2}':'%Y-%m-%d',
            '\d{4}\.\d{2}.\d{2}':'%Y.%m.%d',
            '\d{4}\/\d{2}\/\d{2}':'%Y/%m/%d',
            '\d{2}-\d{2}-\d{2}':'%y-%m-%d',
            '\d{2}\.\d{2}.\d{2}':'%y.%m.%d',
            '\d{2}\/\d{2}\/\d{2}':'%y/%m/%d',
        },
    )

    # dynamic programing ?
    # 2 digits ~ 4 digits number -> year
    # 1~12 in first or second position -> month
    # 1~31 in first or second or third position -> date

    def check_date_format(date_format, date_str):
        for key, format_dict in date_format.items():
            for regex_format, date_format_str in format_dict.items():
                parse = re.fullmatch(regex_format, date_str)
                if parse is not None:
                    return key, date_format_str
        return None, None
    
    for date_str in date_str_list.split(','):
        if '~' in date_str:
            period_type = ''
            period_list = []
            for string in date_str.split('~'):
                date_type, date_format_str = check_date_format(date_format, string)
                if date_type is None:
                    continue
                period_list.append(datetime.strptime(string, date_format_str))
                period_type = date_type

            if not include_range:
                for date in period_list:
                    result.append(date)
                continue

            if period_type in range_to.keys():
                # period save the datetime only
                range_type = range_to[period_type]
                # year, month, date
                if range_type == 'year':
                    for year in range(period_list[0].year,  period_list[1]+1):
                        result.append(year)
                    # period_list to year
                elif range_type == 'month':
                    # year. month
                    month_list = []

                    # first year
                    for month in range(period_list[0].month, 13):
                        month_list.append(datetime(year=period_list[0].year, month = month))

                    # year gap
                    for year in range(period_list[0].year+1, period_list[1].year):
                        month_list.extend([datetime(year=year, month=month) for month in range(1,13)])
                    # last year
                    month_list.extend([datetime(year=period_list[1].year, month=month) for month in range(1, period_list[1].month+1)])
                    # if including year, include year for result period values
                    result.append(month_list)
                elif range_type == 'date':
                    days = (period_list[1] - period_list[0]).days
                    result.append([period_list[0] + timedelta(days=day) for day in range(1, days+1)])
            else:
                continue
            # period 사이의 범주 변경 후 append
            # between 남겨야 되는데

        else:
            date_type, date_format_str = check_date_format(date_format, date_str)
            if date_type is None:
                continue
            result.append(datetime.strptime(date_str, date_format_str))
    return result

    # 하나씩 검사 후 진행,
    # format 은 년도, 월, 일, 년 기간, 월 기간, 일 기간
    # 일자 포함 여부의 경우는 해당 함수에서 검사 제외
    # 범주 의 경우 date lange list 로
    # 범주의 경우 인자를 받아서 치환


def cluster_date_range(date_list):
    # date_list 상에서 포함 여부 반환
    # 가장 큰 값과 가장 작은 값 사이 값 반환 사이 값 반환 시 정렬
    start = min(date_list)
    end = max(date_list)
    gap = [date_instance for date_instance in date_list if date_instance not in [start, end]]
    gap = sorted(gap)
    result = dict(min=min, gap=gap, end=end)

    return result


def print_time(title, second, t):
    print(title, ' for : ', second - t)
    t = second

def create_or_update_data_frame(account_access_log,
                                model,
                                target_df,
                                condition,
                                unique_column_identifier,
                                compare_field_list=[],
                                update_field_list=None,
                                save_outdated_fields=[]):
    result_pk_dict = dict()
    exist_qs = model.objects.filter(**condition)
    if exist_qs.exists():
        control_df = pd.DataFrame.from_records(exist_qs.values())
        result = cluster_from_two_df(target_df, control_df, match_dtypes=True, unique_row_identifiers=unique_column_identifier, compare_field_list=compare_field_list)

        if 'new' in result.keys():
            last_id = model.objects.last().id
            new_df = result['new']
            if issubclass(model, LogModel):
                new_df['access_log'] =account_access_log

            model.objects.bulk_create([model(**record) for record in new_df.to_dict('records')], batch_size=1000)
            result_pk_dict['new_id_list'] = [i for i in range(last_id+1, len(new_df))]
        if update_field_list is not None:
            if 'different_from_target' in result.keys():
                update_df = result['different_from_target']
                outdated_df = result['different_from_control']
                if issubclass(model, LogModel):
                    update_df['update_access_log'] = account_access_log
                set_fields_between_outdated_df_and_new_df(update_df, outdated_df, result['connect_index_group_from_difference'])
                model.objects.bulk_update([model(**record) for record in update_df.to_dict('records')], update_field_list, batch_size=1000)
                result_pk_dict['update_id_list'] = update_df['id'].tolist()
                if save_outdated_fields:
                    # ApiView 의 호출 금지
                    outdated_df['table'] = model._meta.db_table
                    outdated_df['record_pk'] = outdated_df['id']
                    outdated_df['create_dt'] = datetime.now()
                    outdated_df['record_dict'] = outdated_df[save_outdated_fields].apply(lambda row: row.to_dict(), axis=1)
                    outdated_df.drop('id', axis=1, inplace=True)
                    outdated_df['access_log_id'] = account_access_log.id
                    outdated_records = outdated_df[['table', 'record_pk', 'create_dt', 'access_log_id','record_dict']].to_dict('records')

                    OutdatedRecord.objects.bulk_create([OutdatedRecord(**record) for record in outdated_records], batch_size=1000)
    else:
        if model.objects.exists():
            last_id = model.objects.last().id
        else:
            last_id = 0
        model.objects.bulk_create([model(**record) for record in target_df.to_dict('records')], batch_size=1000)
        new_qs = model.objects.filter(id__gt=last_id)
        if new_qs.exists():
            result_pk_dict['new_id_list'] = list(new_qs.order_by('id').values_list('id',flat=True))
    return result_pk_dict

def data_to_df_pivot(data, index, columns, values, values_order=None, replace_nan=None, order_type='columns'):
    # index 기준으로 column 에 대해서 pivot을 진행해서 column의 unique value 를 가진 row의 values에 해당하는 column value를 옆으로 붙여준다.
    # result:
    # pivot index = index
    # column = multi_index (value_column,column_unique_value)
    import pandas as pd
    df = pd.DataFrame.from_records(data)
    df_pivot = df.pivot(index=index, columns=columns, values=values)

    ############################################### optional setting ###################################################
    columns = df_pivot.columns.tolist()
    column_list = []
    column_unique_values = list()
    # column length step values
    for i in range(len(columns) // len(values)):
        column_unique_values.append(columns[i][1].strip())

    attribute_len = len(column_unique_values)

    for index, column in enumerate(columns):
        column_list.append('_'.join(['pivot' + str(index % attribute_len), column[0]]))
    df_pivot.columns = column_list
    if replace_nan is not None:
        df_pivot.fillna('', inplace=True)
    if order_type == 'instance':
        # 하나의 pivot instance 를 생성 후 안에 unique_column object 생성, value name 과 values 를 집어 넣는다.
        def set_pivot(row, unique_values, attributes):
            pivot_instance = dict()
            for idx, value in enumerate(unique_values):
                pivot_result = dict()
                for attribute in attributes:
                    pivot_result[attribute] = row['_'.join(['pivot' + str(idx), attribute])]
                pivot_instance[value] = pivot_result
            return pivot_instance
        df_pivot['pivot'] = df_pivot.apply(lambda row:set_pivot(row, column_unique_values, values), axis=1)
        df_pivot.drop(column_list, axis=1, inplace=True)

    elif order_type == 'column':
        pass
    else:
        pass
    return df_pivot, column_unique_values

def column_transformator(df, required_columns, optional_columns, column_map, rename_columns=None, **kwargs):
    if rename_columns is not None:
        for key, value in rename_columns.items():
            if key in df.columns:
                df.rename(columns={key:value}, inplace=True)

    df_column = df.columns
    exist_column_list = list()
    for column in required_columns:
        if column not in df_column:
            raise Exception('필수 속성값이 없습니다. 필수 속성 값은 ' + ','.join(list(required_columns.keys())) + '입니다.')
        exist_column_list.append(column)
    for column in optional_columns:
        if column in df_column:
            exist_column_list.append(column)

    mapper = dict()
    exist_transformed_column_list = list()
    for column in exist_column_list:
        mapper[column] = column_map[column]
        exist_transformed_column_list.append(column_map[column])
    df.rename(columns=mapper, inplace=True)
    return df, exist_transformed_column_list

def set_fields_between_outdated_df_and_new_df(update_df, outdated_df, index_group, fields=['id']):
    update_index = update_df.index
    for key, value in index_group.items():
        if key in update_index:
            for field in fields:
                update_df.loc[key, field] = outdated_df.loc[value[0], field]

def get_connected_index(target_df, control_df, columns, reset_index=False):
    # 해석 필요
    if reset_index:
        start_index = 1
        target_df.set_index(pd.Index([start_index + i for i in range(len(target_df))]), inplace=True)
        start_index = target_df.index.tolist()[-1] + 1
        control_df.set_index(pd.Index([start_index + i for i in range(len(control_df))]), inplace=True)

    different_group_index = pd.concat([target_df, control_df])
    group_df = different_group_index.groupby(columns).apply(lambda x:tuple(x.index))
    connected_index_group, connected_control_index =[], []
    
    if len(group_df):
        different_group_index = different_group_index.groupby(columns).apply(lambda x:tuple(x.index)).reset_index(
            name='idx')
        different_group_index['len'] = different_group_index.idx.apply(lambda t:len(t))
        different_group_index = different_group_index.loc[different_group_index['len'] > 1]['idx'].tolist()
        connected_index_group = dict()
        # key value
        target_index = target_df.index.tolist()
        connected_control_index = list()
        different_index = control_df.index.tolist()
        for group in different_group_index:
            for index, g in enumerate(group):
                if g in target_index:
                    control_index = [y for y in group if y != g and y in different_index]
                    if len(control_index) == 0:
                        continue
                    connected_index_group[g] = control_index
                    connected_control_index.extend(control_index)
    return connected_index_group, connected_control_index


def cluster_from_two_df(target_df, control_df, match_dtypes=True, drop_duplicate=True, unique_row_identifiers=None,
                        compare_field_list=None, sort_by=None, extract_difference=False):
    """ compare two dataframe and return dict include dataframes grouped by homogeneity as values
    :param pandas.DataFrame target_df: data to be compared
    :param padans.DataFrame control_df: data to compare
    :param bool match_dtypes: if True, match dtypes between target_df and control_df
    :param bool drop_duplicate: if True, exclude duplicated rows from target_df and control_df
    :param list unique_row_identifiers: unique row key value
    :param list compare_field_list: columns to compare target_df from control_df
    :param list sort_by: sort columns for target_df, control_df
    :param bool extract_difference: save excel file contained different contents between target_df and control_df
    :return: dict result_dict:  clustered df by states

    """
    # 2개의 df를 비교해서 변경, 변경전, 새로운 데이터, 변경 되지 않은 데이터, 중복 데이터, 누락 데이터 를 뽑아낸다.
    # none of column is included each df
    result_dict = {}
    include_column_count = 0
    target_columns = target_df.columns.tolist()
    control_columns = control_df.columns.tolist()
    for column in control_columns:
        if column in target_columns:
            include_column_count += 1

    if include_column_count == 0:
        raise Exception('both dataframe has no connection.\n there is not the same column in dataframes!!!')

    if drop_duplicate:
        target_df = target_df.drop_duplicates(keep='first')
        control_df = control_df.drop_duplicates(keep='first')
        if len(target_df) == 0:
            return dict(old=control_df)
        if len(control_df) == 0:
            return dict(new=target_df)

    start_index = 0
    if match_dtypes:
        for column in control_df.columns:
            if column in target_df.columns:
                if target_df[column].dtype != control_df[column].dtype:
                    target_df[column] = target_df[column].astype(control_df[column].dtype)

        target_df.replace({pd.NaT:None}, inplace=True)
        control_df.replace({pd.NaT:None}, inplace=True)

    if sort_by is not None:
        target_df.sort_values(by=sort_by, inplace=True)
        control_df.sort_values(by=sort_by, inplace=True)

    target_df.set_index(pd.Index([start_index + i + 1 for i in range(len(target_df))]), inplace=True)
    start_index = len(target_df)
    control_df.set_index(pd.Index([start_index + i + 1 for i in range(len(control_df))]), inplace=True)
    if unique_row_identifiers is not None:
        concat_df = pd.concat([target_df[unique_row_identifiers], control_df[unique_row_identifiers]], sort=False)
    else:
        concat_df = pd.concat([target_df, control_df], sort=False)
    ########################################## separate by concat column ###############################################
    boolean_index = concat_df.loc[concat_df.duplicated(keep=False)].index

    new_df = target_df.loc[~target_df.index.isin(boolean_index)]
    if len(new_df):
        result_dict['new'] = new_df
    old_df = control_df.loc[~control_df.index.isin(boolean_index)]
    if len(old_df):
        result_dict['old'] = old_df

    compare_target_df = target_df.loc[target_df.index.isin(boolean_index)]
    compare_control_df = control_df.loc[control_df.index.isin(boolean_index)]

    #################################### compare duplicated key column records #########################################

    if compare_field_list is None:
        compare_field_list = [column for column in target_columns if column in control_columns]
    else:
        compare_field_list = [*unique_row_identifiers, *compare_field_list]
    compare_target_df = compare_target_df[compare_field_list]
    compare_control_df = compare_control_df[compare_field_list]

    concat_df = pd.concat([compare_target_df, compare_control_df], sort=False)

    boolean_index = concat_df.duplicated(keep=False)
    duplicated_index = concat_df.loc[boolean_index].index

    ################################################# same df ##########################################################
    same_target_df = target_df.loc[target_df.index.isin(duplicated_index)]
    if len(same_target_df):
        result_dict['same_from_target'] = same_target_df
        
    same_control_df = control_df.loc[control_df.index.isin(duplicated_index)]
    
    if len(same_control_df):
        result_dict['same_from_control'] = same_control_df
    ################################################ different data ####################################################
    different_from_target_df = target_df.loc[
        target_df.index.isin(compare_target_df.loc[~compare_target_df.index.isin(duplicated_index)].index)]
    different_from_control_df = control_df.loc[
        control_df.index.isin(compare_control_df.loc[~compare_control_df.index.isin(duplicated_index)].index)]

    ######################################## get different data with target ############################################
    if len(different_from_control_df) == 0:
        return result_dict		

    different_group_index = pd.concat([compare_target_df, compare_control_df])
    group_df = different_group_index.groupby(unique_row_identifiers).apply(lambda x:tuple(x.index))

    if len(group_df):
        target_control_index_group, control_index2 = get_connected_index(different_from_target_df, different_from_control_df, unique_row_identifiers,
                                                                         reset_index=False)
        if len(target_control_index_group):
            different_from_target_df = different_from_target_df.loc[
                different_from_target_df.index.isin(list(target_control_index_group.keys()))]
            if len(different_from_target_df):
                result_dict['different_from_target'] = different_from_target_df
            different_from_control_df = different_from_control_df.loc[different_from_control_df.index.isin(list(control_index2))]
            if len(different_from_control_df):
                result_dict['different_from_control'] = different_from_control_df
            result_dict['connect_index_group_from_difference'] = target_control_index_group
            ############################################ different_target_excel ##################################################
            if extract_difference:
                if len(different_from_target_df):
                   for record in different_from_target_df.to_dict('records'):
                       x_df =different_from_control_df.copy(True)
                       for field in unique_row_identifiers:
                            x_df = x_df.loc[x_df[field]==record[field]]
                       # print(record['wbs_code'], record['order_num'], record['material_num'], len(
                       #     x_df
                       # ))
                   pd.concat([different_from_target_df, different_from_control_df], sort=False).sort_values(by=[*sort_by, 'drawing_number']).to_excel('점검.xlsx')

        return result_dict

    return result_dict


def set_df_types(df, fields=dict()):
    # type 별 처리 방식 정의, type casting 정의

    if not fields:
        raise Exception('field is empty')

    if 'int' in fields.keys():
        number_list = fields['int']['columns']
        for column in number_list:
            if column not in df.colums:
                continue
            df[column].fillna(0, inplace=True)
            df.fillna("", inplace=True)  # NaN 값을 공백으로 치환
            if df[column].dtype == object:
                # string 으로 변경 후 , 제거 후 다시 object 로 변경
                df.loc[:, column] = df.loc[:, column].astype(str)
                df.loc[:, column] = df.loc[:, column].str.replace(',', '')
                df.loc[:, column] = df.loc[:, column].str.strip()

    if 'float' in fields.keys():
        float_field_list = fields['float']['columns']
        for column in float_field_list:
            if column in df.columns and df[column].dtype == object:
                df.loc[df[column] == '', column] = 0
                df.loc[:, column] = df.loc[:, column].str.replace(',', '')
                df.loc[:, column] = df.loc[:, column].astype('float')

    if 'date' in fields.keys():
        date_field_list = fields['date']['columns']
        for column in date_field_list:
            if column in df.columns:
                date_format = '%Y-%m-%d'

                for val in df.loc[df[column] != '', column].tolist():
                    if val != '' and val is not None:
                        test_val = val

                if type(test_val) is not str:
                    continue

                if len(test_val) > 12:
                    date_format += ' %H:%M:%S'
                    df.loc[df[column] != '', column] = df.loc[df[column] != '', column].str.replace('/', '-')
                    df.loc[df[column] != '', column] = pd.to_datetime(
                        df.loc[:, column].where(df.loc[:, column].notnull())).dt.strftime(date_format)
                else:
                    df.loc[df[column] != '', column] = pd.to_datetime(
                        df.loc[:, column].where(df.loc[:, column].notnull())).dt.date
                df.loc[df[column] == '', column] = None
                df[column] = df[column].replace({pd.NaT:None})

    if 'str' in fields.keys():
        str_field_list = fields['str']['columns']
        for column in str_field_list:
            if column in df.columns:
                df[column] = df[column].astype('str')
                df[column] = df[column].replace({None:''})
                df[column] = df[column].str.strip()


def create_record(params, model, duplicate_field_list):
    model_instance = model()
    try:
        for field_list in duplicate_field_list:
            filter_condition = {field:params[field] for field in field_list}
            duplicated_qs = model.objects.filter(**filter_condition)
            if duplicated_qs.exists():
                raise ValueError(''.join(
                    [key + ':' + str(value) for key, value in filter_condition.items()]) + ' 값은 중복 등록 될 수 없습니다.')
        for key, value in params.items():
            if hasattr(model_instance, key):

                setattr(model_instance, key, value)
        model_instance.save(force_insert = True)
    except ValueError as ve:
        return None, str(ve), 400
    except Exception as e:
        return None, str(e), 500

    return model_instance, '저장되었습니다.', 200


def update_record(params, model, duplicate_field_list):
    model_instance = model()
    try:
        for field_list in duplicate_field_list:
            filter_condition = {field:params[field] for field in field_list}
            duplicated_qs = model.objects.filter(**filter_condition)
            if duplicated_qs.filter(~Q(pk=params['pk'])).exists():
                raise ValueError(''.join(
                    [key + ':' + str(value) for key, value in filter_condition.items()]) + ' 값은 중복 등록 될 수 없습니다.')
        for key, value in params.items():
            if hasattr(model_instance, key):
                setattr(model_instance, key, value)
        model_instance.save(force_update = True)
    except ValueError as ve:
        return None, str(ve), 400
    except Exception as e:
        return None, str(e), 500

    return model_instance, '저장되었습니다.', 200

# 해당 함수를 쪼갠다. parameter setting / duplicate check / save

def set_instance_parameter(model, params):
    model_instance = model()
    now = datetime.now()
    access_log_id = params['author'].accountaccesslog_set.last().id
    model_params = dict()
    params_key = params.keys()
    if 'id' in params:
        model_instance = model.objects.get(id=params['id'])
    if issubclass(model, LogModel):
        if 'id' in params_key and params['id'] == '':
            params['access_log_id'] = access_log_id
            params['create_dt'] = now
            del params['id']
        elif 'id' not in params_key:
            params['access_log_id'] = access_log_id
            params['create_dt'] = now
        elif 'id' in params_key and str.isdigit(params['id']):
            params['update_access_log_id'] = access_log_id
            params['update_dt'] = now
            if model.objects.filter(id=params['id']).exists():
                model_instance = model.objects.get(id=params['id'])
    for key, value in params.items():
        if hasattr(model_instance, key):
            if value == 'null' or value == 'undefined' or value =='':
                value = None
            model_params[key] = value

    return model_params, model_instance, access_log_id, now



def create_or_update_record(params, model, duplicate_field_list, files=None):
    params, model_instance, access_log_id, now = set_instance_parameter(model, params)

    try:
        for field_list in duplicate_field_list:
            filter_condition = {field:params[field] for field in field_list}
            duplicated_qs = model.objects.filter(**filter_condition)
            if duplicated_qs.exists() and (model_instance.id is None or  duplicated_qs.filter(~Q(pk=model_instance.id)).exists()):
                raise ValueError(''.join([key +':' + str(value) for key, value in filter_condition.items() ])  + ' 값은 중복 등록 될 수 없습니다.')
        for key, value in params.items():
            if hasattr(model_instance, key):
                if key in ['id'] and value == '':
                    continue
                if value == "None" or value == 'null' :
                    value = None
                setattr(model_instance, key, value)

        model_instance.save()
        if files is not None and len(files):
            # for key in files.keys():
            attachment_file_list = list()
            default_dict = dict(
                table_name=model._meta.db_table,
                table_pk=model_instance.pk,
                access_log_id=access_log_id,
                create_dt=now
            )
            for key in files.keys():
                attachment_file_list.append(AttachmentFile(
                    **default_dict,
                    file_type=key,
                    file=files.get(key)
                ))
            AttachmentFile.objects.bulk_create(attachment_file_list, batch_size=1000)


        if 'save_outdated_record' in params.keys():
            record_dict = dict()
            for key, value in params.items():
                if hasattr(model(), key):
                    record_dict[key] = value
            # 접근 조차 안되는 이유
            OutdatedRecord(
                table=model._meta.db_table,
                access_log_id=access_log_id,
                record_pk=model_instance.id,
                record_dict=record_dict,
                create_dt=now
            ).save(force_insert=True)

    except ValueError as ve:
        import traceback
        print(traceback.print_exc())
        return None, str('값 형식에 이상이 있습니다.'), 400
    except Exception as e:
        import traceback
        print(traceback.print_exc())
        return None, str('에러가 발생했습니다. 관리자에게 문의 바랍니다.'), 500
    print(model_instance)
    return model_instance, '저장되었습니다.', 200


def paginate(view_instance, context, page_numbers_range=5):
    context['total_cnt'] = len(view_instance.object_list)
    paginator = context['paginator']
    page = view_instance.request.GET.get('page')
    max_index = len(paginator.page_range)
    current_page = int(page) if page else 1

    start_index = int((current_page - 1) / page_numbers_range) * page_numbers_range
    end_index = start_index + page_numbers_range
    if end_index >= max_index:
        end_index = max_index

    page_range = paginator.page_range[start_index:end_index]
    context['page_range'] = page_range

def set_params_with_default_values(context, default_value_dict, search_params=None):
    # pep 308 - ternary does not provide short-circuit
    # context[key] = value if search_params is not None and key not in search_params.keys() else search_params[key]
    if search_params is None:
        for key, value in default_value_dict.items():
            if value is not None and value != '':
                context[key] = value
    else:
        for key, value in default_value_dict.items():
            if key in search_params.keys() and search_params[key] is not None and search_params[key] != '':
                context[key] = search_params[key]
            elif value != '' and value is not None:
                context[key] = value

def download_database_excel(request):
    # project database description to excel
    app_list = [
        'base',
        'equipment',
        'client',
        'material',
        'system',
        'kpi',
        'manufacture',
        'sales',
        'shipment',
        'quality',
    ]

    column_map = {
        'CharField':'char(64)',
        'TextField':'char(64)',
        'EmailField':'char(32)',
        'IntegerField':'int',
        'PositiveIntegerField':'int',
        'DecimalField':'float',
        'FloatField':'float',
        'ForeignKey':'int',
        'ManyToOneRel':'int',
        'TreeForeignKey':'int',
        'CountryField':'str',
        'OneToOneField':'int',
        'BooleanField':'bool',
        'DateTimeField':'datetime',
        'DateField':'date',
        'FileField':'str',
        'ImageField':'str',
        'AutoField':'int'
    }
    # 문서 추출 용 속성
    # 모델 class name, 모델 verbose_name
    # 테이블명, db_name, column_verbose_name, column, column_type, pk, fk, null 허용, 비고
    df_columns = ['table_verbose_name', 'db_name', 'column_verbose_name', 'column_variable_name', 'type', 'pk', 'fk',
                  'null',
                  'comment']
    app_df_list = OrderedDict()

    ##### 테이블 네임 및 필드 추출 및 저장
    for app_name in app_list:
        app_df_list[app_name] = OrderedDict()
        model_list = apps.all_models[app_name]
        for name, model_cls in model_list.items():
            db_name = model_cls._meta.db_table,
            db_name = db_name[0]
            table_name = model_cls._meta.verbose_name

            df = pd.DataFrame(columns=df_columns)
            for field in model_cls._meta._get_fields():
                # help
                class_name = str(field.__class__)
                class_name = class_name.replace('<', '')
                class_name = class_name.replace('>', '')
                class_name = class_name.replace('\'', '')
                class_name = class_name.split('.')[-1]
                if 'Rel' in class_name or 'ManyToManyField' in class_name:
                    continue
                df = df.append([{'table_verbose_name':table_name,
                                 'db_name':db_name,
                                 'column_verbose_name':str(getattr(field, 'verbose_name')) if hasattr(field,
                                                                                                      'verbose_name') else '',
                                 'column_variable_name':getattr(field, 'name') if hasattr(field, 'name') else '',
                                 'type':column_map[class_name],
                                 'pk':getattr(field, 'primary_key') if hasattr(field, 'primary_key') else '',
                                 'fk':class_name in ['OneToOneField', 'ForeignKey'],
                                 'null':getattr(field, 'null') if hasattr(field, 'null') else '',
                                 'comment':''}], )
            app_df_list[app_name][db_name] = df


def delete_common(view_instance, save_record_field=None):

    pk_list = json.loads(view_instance.request.body.decode('UTF-8'))['pk_list']
    reference_protected_list = []
    for obj_id in pk_list:
        try:
            qs = view_instance.model.objects.filter(id=obj_id)
            if qs.exists():
                if save_record_field is not None and len(save_record_field) >0:
                    instance = qs.last()
                    OutdatedRecord(
                        author_id=view_instance.request.session.get('id'),
                        table=view_instance.model._meta.db_table,
                        record_pk=obj_id,
                        record_dict={
                            field:getattr(instance, field) for field in save_record_field
                        }
                    )
                qs.delete()

        except ProtectedError as protect:
            reference_protected_list.append(view_instance.model.objects.get(id=obj_id).__str__() +'는 ' + protect.args[1][0]._meta.verbose_name + '에서 참조 중입니다.')
            reference_protected_list.append('\n')
    status_code = 202

    return str(len(pk_list) - len(reference_protected_list)) + ' 건 삭제 되었습니다. \n' + ''.join(reference_protected_list), status_code


def get_screen_comment(path):
    path = path.split('?')[0]

    menu_qs = Menu.objects.filter(url=path)
    if menu_qs.exists():
        return menu_qs.last().user_comment
    else:
        return None