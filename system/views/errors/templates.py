from django.shortcuts import render


def custom_400_view(request, *args, **kwargs):
	context = kwargs
	print(400, request)
	response = render(request, 'errors/400.html', context)
	response.status_code = 400
	return response

def custom_403_view(request, *args, **kwargs):
	context = kwargs
	print(403, request)
	response = render(request, 'errors/403.html', context)
	response.status_code = 403
	return response

def custom_404_view(request, *args, **kwargs):
	context = kwargs
	print(404, request)
	response = render(request, 'errors/404.html', context)
	response.status_code = 404
	return response

def custom_500_view(request, *args, **kwargs):
	context = kwargs
	print(500, request)
	response = render(request, 'errors/500.html', context)
	response.status_code = 500
	return response

def custom_502_view(request, *args, **kwargs):
	context = kwargs
	print(500, request)
	response = render(request, 'errors/500.html', context)
	response.status_code = 502
	return response

