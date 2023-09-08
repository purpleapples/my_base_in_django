from django.views.generic import TemplateView


class TestView(TemplateView):
	template_name = 'test/test.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		month_days_dict = dict()
		from datetime import datetime
		from calendar import monthrange
		year = datetime.now().year
		for month in range(1,13):
			month_range = monthrange(year, month)
			month_days_dict[month] = [day for day in range(month_range[0], month_range[1]+1)]
		context['month_days_dict'] = month_days_dict
		return context
