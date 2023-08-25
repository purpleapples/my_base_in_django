
from django.shortcuts import redirect

from accounting.models import AccountingInputPeriod

class InputPeriodCheckMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		response = self.get_response(request)

		if request.method == 'POST':
			if 'year' in request.POST.keys():
				input_period_qs = AccountingInputPeriod.objects.filter(year=request.POST['year'],end_date__isnull=True)
				if not input_period_qs.exists():
					# raise 300 error
					return response

		return response
