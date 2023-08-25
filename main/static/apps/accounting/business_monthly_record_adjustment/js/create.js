window.onload = function(){
    initFileBox(document.querySelector('.file-box').parentElement);
    document.querySelector('.button.save').onclick = (event) => saveData(event);

    // # 일정 조건 하에 select를 활성화 하는 방법:
    attachEventToSelectControl();
    createMultipleTimeSelectContainer(
        document.getElementById('date-input-container'),
        ['date','date_range'],
        {
           setResult:true,
           isResultConcat:true,
           checkRange:true,
           limitRange:'year'
        }
    );
    const businessSelect = document.getElementById('business_id');
    const businessFacilitySelect = document.getElementById('facility_id');
    const businessFacilityOperationProgramSelect = document.getElementById('program_id');

    setChildSelectOptions(businessSelect, businessFacilitySelect, 'parentId');
    setChildSelectOptions(businessFacilitySelect, businessFacilityOperationProgramSelect, 'parentId');
    document.getElementById('type').dispatchEvent(new Event('change'));
}

function saveData(event){
    const form = document.getElementById('form');
    if(document.querySelector('[name=date_list]').value == ''){
        alert('일자는 비워둘 수 없습니다.');
        return;
    }

    let firstDate = form.date_list.value.split(',')[0].substr(0,4);
    form.year.value = parseInt(firstDate);

    for (const element of form.elements){
        if (element.required && element.value == ''){
            element.focus();
            alert('필수값 이 비워져있습니다.');
            return;
        }
    }
    const formData = new FormData(form);
    fetchEvent('/accounting/business-monthly-record-adjustment/api', undefined, 'POST', formData, (data)=>{
        alert(data.message);
        location.href='/accounting/business-monthly-record-adjustment/list/';
    });
}

// 각 element에 대한 통제는 개별적으로 움직인다.
// chained 일 경우 : fetch event 이후 실행

function attachEventToSelectControl(){
    // 들어오는 값에 대해 해당 select 혹은 input 활성화 하는 함수로 변경

    document.getElementById('type').onchange = (event) => {
        // 조정 대상 선택
        const item = event.target.selectedOptions[0].dataset.item;
        const businessFacilitySelect = document.getElementById('facility_id');
        const businessFacilityOperationProgramSelect = document.getElementById('program_id');
        switch(item){
            case '사업':
                businessFacilitySelect.disabled = true; businessFacilityOperationProgramSelect.disabled=true; break;
            case '시설' :
                businessFacilitySelect.disabled = false; businessFacilityOperationProgramSelect.disabled=true; break;
            case '프로그램':
                businessFacilitySelect.disabled = false; businessFacilityOperationProgramSelect.disabled=false;break;
        }
        // period selector 의 경우 새로 생성 필요
    }
}