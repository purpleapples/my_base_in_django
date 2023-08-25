from urllib.parse import urlencode, quote_plus
import xml.etree.ElementTree as et

import pandas as pd
import requests
import datetime

def get_national_consumer_prices_rate(year:int) -> int :
	""" kosis openapi 소비자 물가지수 조회
	인증키 유효 기간 : 2025.07.13
	:param year: 소비자물가지수상승율 확인 년도
	:return: int rate
	"""
	url = 'https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=Y2M4YWJiZWE4ZTJlM2M3ZmU3MTIxM2NiN2I1ODUxYWY=&itmId=T+&objL1=T10&objL2=&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=Y&newEstPrdCnt=5&outputFields=ORG_ID+TBL_ID+TBL_NM+OBJ_ID+OBJ_NM+OBJ_NM_ENG+NM+NM_ENG+ITM_ID+ITM_NM+ITM_NM_ENG+UNIT_NM+UNIT_NM_ENG+PRD_SE+PRD_DE+&orgId=101&tblId=DT_1J20003'
	result = requests.get(url)
	try:
		str_to_list = eval(result.text)
		consumer_price_rate_df = pd.DataFrame(str_to_list)
		consumer_price_rate_df['rate'] = 0
		index_list = consumer_price_rate_df.index.tolist()
		consumer_price_rate_df['DT'] = consumer_price_rate_df['DT'].astype(float)
		consumer_price_rate_df['PRD_DE'] = consumer_price_rate_df['PRD_DE'].astype(int)
		for idx in range(1, len(index_list)):
			ahead_index = index_list[idx-1]
			current_index = index_list[idx]
			rate = consumer_price_rate_df.loc[current_index, 'DT'] / consumer_price_rate_df.loc[ahead_index, 'DT'] -1
			rate *= 100
			rate = round(rate,1)
			consumer_price_rate_df.loc[current_index, 'rate'] = rate
		rate = consumer_price_rate_df.loc[consumer_price_rate_df['PRD_DE'] == year, 'rate']
		if len(rate):
			return rate.values[0]
		else:
			return None
	except Exception as e:
		import logging
		logger = logging.getLogger('my')
		import traceback
		logger.error(traceback.print_exc())
		pass


def get_kosis_api():
	# 물가 확인 주소
	# https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1J20041&vw_cd=MT_ZTITLE&list_id=P2_6&scrId=&seqNo=&lang_mode=ko&obj_var_id=&itm_id=&conn_path=MT_ZTITLE&path=%252FstatisticsList%252FstatisticsListIndex.do
	# 물가 상승률 = 총 지수
	url = 'http://kosis.kr/kosisapi/service/IndicatorService/IndDetailSearchRequest'
	service_key = 'UdbH1%2FikdhDXf9u75rjDcCz4IPxKcLvbD23cibCi8xuw3bI96x1k1031oASMlhDXXCUtz5t%2FMUa4%2FvV3bYqtDQ%3D%3D'
	service_key2 = 'UdbH1/ikdhDXf9u75rjDcCz4IPxKcLvbD23cibCi8xuw3bI96x1k1031oASMlhDXXCUtz5t/MUa4/vV3bYqtDQ=='
	query_params = '?' + urlencode({quote_plus('STAT_JIPYO_NM'):'물가',
									quote_plus('serviceKey'):service_key2,
	                                quote_plus('STRT_PRD_DE'):str(datetime.datetime.now().year),
	                                quote_plus('_type'):'json'})
	print(url + query_params)
	response = requests.get(url + query_params)
	print(response.text)

def get_holidays(year, month):
	## 공공 데이터 포털 한국 천문 연구원특일 정보 open api - https://www.data.go.kr/iim/api/selectAPIAcountView.do
	## api return value type: xml only
	## data structure : dateName : 공휴일이름 , locdate: 일자(YYYYMMDD)
	## return type = list<str>
	date_list = list()
	url = "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo"
	service_key ="UdbH1/ikdhDXf9u75rjDcCz4IPxKcLvbD23cibCi8xuw3bI96x1k1031oASMlhDXXCUtz5t/MUa4/vV3bYqtDQ=="
	month = '0' +str(month) if 10 > month else str(month)
	query_params = '?' + urlencode({quote_plus('serviceKey'):service_key,
		quote_plus('solYear'):year, quote_plus('solMonth'):month})
	response = requests.get(url + query_params)
	xml_element = et.fromstring(response.content)
	items = xml_element.findall('./body/items/item')

	for item in items:
		date_list.append(item.find('./locdate').text)
	return date_list

def get_year_lowest_wise():

	url="http://api.odcloud.kr/api/15068774/v1/uddi:21d816e5-6c44-4e30-903d-e98e30a4f227"
	service_key = 'UdbH1/ikdhDXf9u75rjDcCz4IPxKcLvbD23cibCi8xuw3bI96x1k1031oASMlhDXXCUtz5t/MUa4/vV3bYqtDQ=='
	return_type='json'
	query_params = '?' + urlencode({quote_plus('serviceKey'):service_key, quote_plus('return_type'):return_type,
	                                quote_plus('page'):1, quote_plus('perPage'):10})
	response = requests.get(url+query_params)
	import json
	return json.loads(response.text)['data']
