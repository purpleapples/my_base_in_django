window.onload = function(event){
    setTableEventListerDefault(document.getElementById('table'));
}

function saveAdjustmentCodeDetail(target){
    const tr = target.closest('tr');
    // 년도별 생성
    const formData = new FormData();
    // delete period_code_id

    for( const field of ['adjustment_code_id','item_code_id']){
        let input = tr.querySelector(`[name="${field}"]`);
        if (input.value == undefined){
            alert('조정 코드 상세 값은 전부 채워넣어야 합니다.\n코드가 부족할 경우 관리자 문의바랍니다.');
            return;
        }
        formData.set(field, input.value);
    }
    if (tr.querySelector('[name=id]').value != undefined){
        formData.set('id', tr.querySelector('[name=id]').value);
    }
    formData.set('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);
    fetchEvent('/base/adjustment-code-detail/api', undefined, 'POST', formData, (data)=>{
        alert(data.message);
        location.reload();
    });
}