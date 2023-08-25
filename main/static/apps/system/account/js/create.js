window.onload = function(){

    document.querySelector('.button.save').onclick = (event)=>{

        const formData = new FormData(document.querySelector('form'));

        if(!checkPassword()){
            return false;
        }
        fetchEvent('/system/account/api', undefined, 'POST', formData, (data)=>{
            alert(data.message);
            location.href = '/system/account/list/';
        });
    }
    for(let element of document.querySelectorAll('[name=password], [name=password_confirm]')){
        element.addEventListener('change', function(event){
            fn_press_han(this);
            checkPassword(event.target);
        });
    }
};


function fn_press_han(obj){
    obj.value = obj.value.replace(/[ㄱ-하-ㅣ가-힣]/g,'');
}

// 유효성 체크 임시 해제
function checkPassword(){
    const password = document.querySelector('[name=password]');
    const passwordConfirm = document.querySelector('[name=password_confirm]');
    let pw = password.value;
    let num = pw.search(/[0-9]/g);
    let eng = pw.search(/[a-z]/ig);
    let spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);
    if(pw.length < 8){
        alert('비밀번호 자리수 는 8자리 이상입니다.');
        return false;
    }else if(pw.search(/\s/) != -1){
        alert('비밀번호에는 띄어쓰기를 사용할 수 없습니다.');
        return false;
    }else if(num < 0 || eng < 0 || spe < 0 ){
        alert("영문,숫자, 특수문자를 혼합하여 입력해주세요.");
        return false;
    }
    if(password.value!=passwordConfirm.value){
        alert('비밀번호가 일치하지 않습니다.');
        passwordConfirm.value = '';
        return false;
    }else{
        return true;
    }
}
