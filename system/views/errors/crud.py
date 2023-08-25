from django.shortcuts import render


def custom_bad_request_view(request, *args, **kwargs):
	context = {}
	print(400, request)
	response = render(request, 'errors/400.html', context)
	response.status_code = 400
	return response

def custom_permission_denied_view(request, *args, **kwargs):
	context = {}
	print(403, request)
	response = render(request, 'errors/403.html', context)
	response.status_code = 403
	return response

def custom_page_not_found_view(request, *args, **kwargs):
	context = {}
	print(404, request)
	response = render(request, 'errors/404.html', context)
	response.status_code = 404
	return response

def custom_code_error_view(request, *args, **kwargs):
	context = {}
	print(500, request)
	response = render(request, 'errors/500.html', context)
	response.status_code = 500
	return response

