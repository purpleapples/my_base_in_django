from django.views.generic import TemplateView


#@method_decorator(login_required, name='dispatch')
class InitData(TemplateView):
    template_name = 'init_data.html'
