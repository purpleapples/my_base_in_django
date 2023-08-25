window.onload = function(){
    initFileBox(document.querySelector('.file-box').parentElement);
    document.querySelector('.button.save').onclick = (event) => saveData(event);
    document.getElementById('type').onchange = (event)=>{
        const messageTr = document.getElementById('message');
        const answerTr = document.getElementById('answer');

        if(event.target.value == 6){
            messageTr.classList.remove('hidden');
            answerTr.classList.add('hidden');
        }else if(event.target.value == 4){
            answerTr.classList.remove('hidden');
            messageTr.classList.add('hidden');
        }else{
            messageTr.classList.add('hidden');
            answerTr.classList.add('hidden');
        }
    }
    // 선택 대상 질의로 한정
    document.getElementById('popup_bulletin_board_list').onclick = (event)=>{
        event.stopImmediatePropagation();
        openPopupList('/system/bulletin-board/list/', function(tr_list){
            const tr = tr_list[0];
            console.log(tr.querySelector('[name=id]').value);
            document.getElementById('question_id').value = tr.querySelector('[name=id]').value;
            document.getElementById('question_title').value =tr.children[1].textContent.trim();
        });
    }
}

function saveData(event){    
    const form = document.getElementById('form');
    const typeSelect = document.getElementById('type');
    if(typeSelect.options[typeSelect.selectedIndex].textContent == '답신' && form.question_title.value == ''){
        alert('선택된 질의 게시물이 없습니다.');
        return;
    }
    const formData = new FormData(form);
    fetchEvent('/system/bulletin-board/api', undefined, 'POST', formData, (data)=>{
        alert(data.message);
        location.href='/system/bulletin-board/list/';
    });
}
