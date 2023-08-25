import json
# from django.http import request as req
from django.urls import get_resolver, get_urlconf, URLResolver

from django.http import HttpResponse


def create_backup_data(request):
	# backup 데이터 생성
	# request 를 통해서 이전 화면의 url을 얻고 해당 화면의 class 를 이용해서 model을 얻는다.

	previous_url = request.META['HTTP_REFERER']
	# third location of /
	previous_url = previous_url[previous_url.find('/', 10):]

	resolver = get_resolver()
	p = ''
	for pattern_or_resolver in resolver.url_patterns:
		if type(pattern_or_resolver) is URLResolver:
			app_resolver = pattern_or_resolver
			for pattern in app_resolver.url_patterns:
				if type(pattern) is URLResolver:
					continue
				print(pattern.pattern)
				print()
				print( pattern.lookup_str)
				print(',')
		else:
			p=pattern_or_resolver

	print(dir(p))
	pk_list  = json.loads(request.body.decode('UTF-8'))

	return HttpResponse(
		json.dumps({'message':'전송'}), content_type='application/json'
	)
