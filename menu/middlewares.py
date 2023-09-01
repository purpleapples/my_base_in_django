import re

import pandas as pd
from django.shortcuts import redirect

from menu.models import Menu


class AccountPermissionMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):

		"""
		check account menu permission by url path registered in screen
		if an account is a superuser, then pass all urls
		else path will be checked in three ways
			1. is the api call?
			2. is an url path is registered
				2 - 1. check is there any kind of path using url pattern
			if the examination failed, response url fix as login url
			else go their path
		:param request{django.http.request}
		:return: response
		"""

		request_path= request.path
		response = self.get_response(request)
		from menu.models import MenuPermission
		# 단위계 추출 하되
		#  /menu/3/function/list
		if request_path == '/favicon.ico':
			return response

		if (request.user.is_authenticated and request.path == '/home/') or request.path == '/':
			if request.path == '/' and request.user.is_authenticated:
				return redirect('/home/')
			else:
				return response
		if request.user.is_superuser:
			return response
		menu_qs = Menu.objects.filter(is_screen=True)
		# divide by existence of path_converter
		menu_df = pd.DataFrame.from_records(menu_qs.values())
		path_converter_indexes = menu_df['url'].str.contains(':')
		def change_path_converter_to_regex_pattern(url):
			convert_dict = {}
			for split_context in url.split('\/'):
				if ':' in split_context:
					type_str = split_context.split(':')
					if type_str =='slug':
						convert_dict[split_context] = '[\w]{1,}'
					else:
						convert_dict[split_context] = '[\d]{1,}'
			for key, value in convert_dict.items():
				url = url.replace(key, value)
			return url

		menu_df['url'] = menu_df['url'].apply(lambda url: url.replace('/', '\/'))
		menu_df.loc[path_converter_indexes, 'url'] = menu_df.loc[path_converter_indexes, 'url'].apply(
			lambda url :change_path_converter_to_regex_pattern(url)
		)
		############################################# check by url type ################################################
		menu = None

		is_not_screen = 'media' in request.path or 'api' in request.path

		if is_not_screen:
			request_path = '/' + '/'.join(request.headers['Referer'].split('/')[3:])
			for record in menu_df.to_dict('records'):
				result = re.findall(record['url'], request_path)
				if len(result):
					menu = menu_qs.get(id=record['id'])
					account = request.user
					break
		else:
			############################################## url check ###################################################
			# / 로 split 하고 일치여부를 검사 한다.
			for record in menu_df.to_dict('records'):
				result = re.findall(record['url'], request_path)
				if len(result):
					menu = menu_qs.get(id=record['id'])
					break
			account = request.user
		if menu is not None:
			qs = MenuPermission.objects.filter(menu_id=menu.id)
		else:
			return redirect('/')
		if hasattr(account, 'info') and account.info.permission_group is not None:
			qs = qs.filter(permission_group_id=account.info.permission_group.id)
		else:
			qs = qs.filter(account=account)
		if not qs.exists():
			return redirect('/')

		# 405 method not allowed
		if is_not_screen:
			method = request.method
			if 'media' in request_path and method == 'GET':
				if not qs.filter(download_permitted=True).exists():
					# 권한 에러 처리
					return redirect('/')
			elif method == 'GET':
				if not qs.filter(search_permitted=True).exists():
					# 권한 에러 처리
					return redirect('/')
			elif method == 'POST':
				if len(request._files):
					if not qs.filter(upload_permitted=True).exists():
						# 권한 에러 처리
						return redirect('/')
				else:
					if 'id' in request.POST.keys():
						if not qs.filter(update_permitted=True).exists():
							return redirect('/')
						else:
							if not qs.filter(create_permitted=True).exists():
								return redirect('/')
			elif method == 'DELETE':
				if not qs.filter(delete_permitted=True).exists():
					return redirect('/')
			# 권한 에러

		return response
