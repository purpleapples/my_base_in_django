# abstract base class
# once set model and get_template_name

# interface for create, update, list, detail
# create, update, list, detail
# find a reason which is taking rendering template so long between rendering or context
from django.views.generic import TemplateView

# /????
class CustomCreateView(TemplateView):
	## templateView not allow http method post

	def get_template_names(self):
		return self.model._meta.__str__().replace('.','/') +'/create.html'

 #
 #
 #
 #
 #