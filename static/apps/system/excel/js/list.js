window.onload = function(){
    // setTableEventListerDefault();
    _eventOnInsideFileBox();
    const isMultiple = document.querySelector('[name=isMultiple]').value;
    initFileContainer(
        '.input-file-container',
        'excel-file',
        isMultiple == 'True');
    const submitButton =document.getElementById('button-submit');
    submitButton.onclick = (event) => formSubmit(event);
    const excel_file = document.querySelector('[name=excel-file]');
    excel_file.addEventListener('change', function(event){
        document.getElementById('button-submit').disabled = event.target.value == '';
    });
}

function formSubmit(){
    const form = document.getElementById('form');
    let formData = new FormData(form);
    formData.set('year', document.getElementById('year').value);
    formData.method = 'POST';
    if (document.querySelector('[name=excel-file]').value ==''){
        alert('선택된 파일이 없습니다.');
        return;
    }
    fetchEvent(form.action, undefined, 'POST', formData, (data)=>{
        alert(data.message);
        location.reload();
    });
}
