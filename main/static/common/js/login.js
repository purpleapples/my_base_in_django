
$(document).keyup(function(e) {
    if(e.keyCode == 13) {
        loginSystem();
    }
    _eventOnTabTemplate();
});


function findInfoSubmit() {
    const token = $("input[name='csrfmiddlewaretoken']").val();
    const type = $(".findInfoModal input[name='type']").val();
    const id = $(".findInfoModal input[name='id']").val();
    const email = $(".findInfoModal input[name='email']").val();
    const email2 = $(".findInfoModal input[name='email2']").val();
    let data;

    if(type == "id") { // ID
        if(!email) {
            alert("이메일을 입력해주세요.");
            $(".findInfoModal input[name='email']").focus();
            return false;
        }

        if(email) {
            if(!email_check(email)) {
                alert("올바른 이메일을 형식을 입력해주세요.");
                $(".findInfoModal input[name='email']").focus();
                return false;
            }
        }

        data = {
            csrfmiddlewaretoken: token,
            type: type,
            email : email
        }
    } else { // PW
        if(!id) {
            alert("아이디를 입력해주세요.");
            $(".findInfoModal input[name='id']").focus();
            return false;
        }

        if(!email2) {
            alert("이메일을 입력해주세요.");
            $(".findInfoModal input[name='email2']").focus();
            return false;
        }

        if(email2) {
            if(!email_check(email2)) {
                alert("올바른 이메일을 형식을 입력해주세요.");
                $(".findInfoModal input[name='email2']").focus();
                return false;
            }
        }
        data = {
            csrfmiddlewaretoken: token,
            type: type,
            email : email2,
            id : id
        }
    }

    $.ajax({
        url: "/system/api/account/find/",
        type: 'POST',
        data: data,
        success:function(data) {
            let is_success = true;

            /*** ID 찾기 결과 ***/
            if(type == 'id') {
                if(data.result =='A') {  // 일치하는 이메일이 없는 경우
                    alert("존재하지 않는 이메일입니다. 다시 입력해주세요.");
                    is_success = false;
                } else {
                    alert("해당 이메일로 아이디를 전송하였습니다.");
                }
            }

            /*** PassWord 찾기 결과 ***/
            if(type == 'pw') {
                if(data.result =='B') {  // 일치하는 아이디가 없는 경우
                    alert("존재하지 않는 아이디, 이메일입니다. 다시 입력해주세요.");
                    is_success = false;
                } else {
                    alert("해당 이메일로 임시비밀번호를 전송하였습니다.");
                }
            }

            if(is_success) {
                $(".findInfoModal").hide();
            }
        }
    });
}

function email_check(email) {
    var regex=/([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    return (email != '' && email != 'undefined' && regex.test(email));
}
