from django.shortcuts import redirect

from menu.models import ScreenFunction


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

		response = self.get_response(request)
		from menu.models import Screen, MenuPermission
		from django.db.models import Q
		path_split = request.path.split('?')[0]

		if (request.user.is_authenticated and request.path == '/home/') or request.path == '/':
			if request.path == '/' and request.user.is_authenticated:
				print('2')
				return redirect('/home/')
			else:
				print(response)
				return response

		if request.user.is_superuser:
			return response

		screen = None
		if 'media' in path_split:
			path_split = '/'+'/'.join(request.headers['Referer'].split('/')[3:])

		if 'api' in path_split:
			path_split = '/' + '/'.join(request.headers['Referer'].split('/')[3:])
			qs = Screen.objects.filter(url=path_split)
			if not qs.exists():
				path_split = '/'.join(path_split[:len(path_split) - 2]) + '/'
				qs = Screen.objects.filter(url=path_split)
				if not qs.exists():
					return redirect('/')
				else:
					screen = qs.last()
					account = request.user
			else :
				screen = qs.last()
				account = request.user

		else:

			screen_qs = Screen.objects.filter(url=path_split)

			if not screen_qs.exists():
				# check path_converter is exists
				path_split = path_split.split('/')
				path_split = '/'.join(path_split[:len(path_split) - 2]) + '/'
				screen_qs = Screen.objects.filter(url=path_split)
				if not screen_qs.exists():
					return redirect('/')
				else:
					screen = screen_qs.last()
			else:
				screen = screen_qs.last()
			account = request.user

		if screen is not None:
			qs = MenuPermission.objects.filter(menu_id=screen.menu_id)
		else:
			return redirect('/')

		if account.teammember_set.exists() and hasattr(account, 'info') and account.info.account_type_code is not None:

			team_id = account.teammember_set.last().team.id
			qs = qs.filter(
				Q(team_id=team_id, account=account,
				  account_type_code=account.info.account_type_code)
				| Q(team_id=team_id, account=account,
				    account_type_code__isnull=True)
				| Q(team_id=team_id, account__isnull=True,
				    account_type_code=account.info.account_type_code)
				| Q(team_id=team_id, account__isnull=True,
				    account_type_code=account.info.account_type_code)
				| Q(team_id=team_id, account__isnull=True,
				    account_type_code__isnull=True)
				| Q(team__isnull=True, account=account,
				    account_type_code=account.info.account_type_code)
				| Q(team__isnull=True, account=account,
				    account_type_code__isnull=True)
			)
		elif account.teammember_set.exists():
			team_id = account.teammember_set.last().team.id
			qs = qs.filter(
				Q(team_id=team_id, account=account,
				  account_type_code__isnull=True)
				| Q(team_id=team_id, account__isnull=True,
				    account_type_code__isnull=True)
				| Q(team__isnull=True, account=account,
				    account_type_code__isnull=True)
			)
		elif hasattr(account, 'info') and account.info.account_type_code is not None:
			qs = qs.filter(
				Q(team__isnull=True, account=account,
				  account_type_code=account.info.account_type_code)
				| Q(team__isnull=True, account=account,
				    account_type_code__isnull=True)
			)
		else:
			qs = qs.filter(team__isnull=True,
			                         account_type_code__isnull=True,
			                         account=account)
		if not qs.exists():
			return redirect('/')
		return response
