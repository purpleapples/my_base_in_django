from django import forms
from django.db.models import Q

from system.models import Account
from .models import Company


## COMPANY
class CompanyForm(forms.ModelForm):


    error_field = forms.CharField(widget=forms.TextInput(attrs={'value':'test'}))
    class Meta:
        model = Company
        fields = '__all__'

        widgets = {
            'client_code':forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'code':forms.TextInput(attrs={'class':'form-control'}),
            'branch':forms.TextInput(attrs={'class':'form-control'}),
            'manager': forms.Select(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'rating': forms.Select(attrs={'class': 'form-control'}),
            'type': forms.Select(attrs={'class': 'form-control'}),
            'representative': forms.TextInput(attrs={'class': 'form-control'}),
            'rep_number': forms.TextInput(attrs={'class': 'form-control','placeholder':'000-0000-0000 (숫자만 입력)'}),
            'fax_number': forms.TextInput(attrs={'class': 'form-control','placeholder':'000-0000-0000 (숫자만 입력)'}),
            'email': forms.TextInput(attrs={'class': 'form-control'}),
            'registration_number': forms.TextInput(attrs={'class': 'form-control'}),
            'comment': forms.Textarea(attrs={'class': 'form-control'}),
            'is_active':forms.CheckboxInput(attrs={'class':'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super(CompanyForm, self).__init__(*args, **kwargs)
        self.fields['error_field'].required = False
        self.fields['manager'].queryset = Account.objects.filter(~Q(type__in=['SUPERVISOR','DKINNOVATION']))
        for field in ['rating', 'representative', 'fax_number','email','registration_number','comment']:
            self.fields[field].required=False


