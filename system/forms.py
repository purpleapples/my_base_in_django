# from bootstrap_datepicker_plus import DatePickerInput
from django import forms
from .models import Account


class AccountForm(forms.ModelForm):

    class Meta:
        model = Account
        fields = ['username',
                  'password',
                  'email',
                  'is_active'
                  ]

        widgets = {
            'username': forms.TextInput(attrs={'class':'form-control'}),
            'password': forms.PasswordInput(attrs={'class':'form-control'}),
            'name': forms.TextInput(attrs={'class':'form-control'}),
            'email': forms.EmailInput(attrs={'class':'form-control'}),
            'type': forms.Select(attrs={'class':'form-control'}),
            'team': forms.TextInput(attrs={'class':'form-control'}),
            'position': forms.Select(attrs={'class':'form-control'}),
            'process':forms.Select(attrs={'class':'form-control'}, choices=(('N/A', '해당 없음'),)),
            'is_active': forms.CheckboxInput(attrs={'class':'form-control'}),
        }
        labels = {
            'username': '사용자 계정',
            'password': '비밀번호',
            'name': '사용자 이름',
            'email': '이메일',
            'phone_number': '연락처',
            'type': '계정 유형',
            'position': '직책',
            'team':'소속 부서',
            'process':'공정 유형',
            'factory':'공장',
            'is_active': '계정 활성화 여부'
        }

    def clean(self):
        cleaned_data = super().clean()

        #if email and Account.objects.filter(email=email).exists():
            #self.add_error('email', '존재하는 이메일입니다.')


class PasswordUpdateForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = ['username', 'name', 'password']

        widgets = {
            'username': forms.TextInput(attrs={'class':'form-control','readonly':'readonly'}),
            'password': forms.PasswordInput(attrs={'class':'form-control'}),
            'name': forms.TextInput(attrs={'class':'form-control'}),
        }
        labels = {
            'username': '사용자 계정',
            'name': '사용자 이름',
            'password': '새 비밀번호',
        }

    def clean_password(self):
        return self.initial["password"]


class LoginForm(forms.Form):
    username = forms.CharField(
        error_messages={
            'required': '아이디를 입력해주세요.'
        },
        max_length=64, label='이메일'
    )
    password = forms.CharField(
        error_messages={
            'required': '비밀번호를 입력해주세요.'
        },
        widget=forms.PasswordInput, label='비밀번호'
    )

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        password = cleaned_data.get('password')
        """
        if username and password:
            try:
                User = get_user_model()
                user = Account.objects.get(username=username)
            except Account.DoesNotExist:
                self.add_error('username', '아이디가 존재하지 않습니다.')
                return  

            if not check_password(password, user.password):
                user.fail_count += 1
                if user.fail_count >= 5 :
                    user.is_active = False
                user.save()
                self.add_error('password', '비밀번호가 틀렸습니다.')
            
            if not user.is_active:
                self.add_error('password', '비활성화 계정입니다. 계정을 활성화 해주세요.')

            #if user.is_login_checked == True:
                #self.add_error('username', '로그인 되어있는 계정입니다.')
        """

