window.onload = function(){
    initFileBox(document.querySelector('.file-box').parentElement);
    document.querySelector('.button.save').onclick = (event) => saveData(event);
    setYearInput(document.querySelector('[name=year]'));
    setNumberInputCheck(document.getElementById('rate'),{
        min:0,max:100,minLength:0, maxLength:3
    });
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
    // 사업 선택 시 예산 코드 유니크 잡아 온다.
    const adjustmentTypeSelect = document.getElementById('type');
    adjustmentTypeSelect.onchange = (event) => _eventOnChangeAdjustmentCode(event);
    adjustmentTypeSelect.dispatchEvent(new Event('change'));
    const date_list = document.getElementById('registered-date-list');
    document.getElementsByName('date_list')[0].value=date_list.value;
    date_list.remove();

}

function saveData(event){
    const form = document.getElementById('form');

    if(document.querySelector('[name=date_list]').value == ''){
        alert('일자는 비워둘 수 없습니다.');
        return;
    }

    let firstDate = form.date_list.value.split(',')[0].substr(0,4);
    form.year.value = parseInt(firstDate);

    const formData = new FormData(form);
    fetchEvent('/accounting/personal-cost-adjustment/api', undefined, 'POST', formData, (data)=>{
        alert(data.message);
        location.href='/accounting/personal-cost-adjustment/list/';
    });
}


function _eventOnChangeAdjustmentCode(event){

        // 기간 입력 방식 +
        const item = event.target.selectedOptions[0].dataset.item;

        if (item == ''){
            alert('조정 항목 상세 내역이 설정 되지 않았습니다. \n 조정 항목 상세에서 적용 후 사용바랍니다.');
            location.href='/base/code-table/adjustment/personal_cost/update-detail/list/'
            return;
        }
        const businessIdSelect = document.getElementById('business_id');
        const personalCostCodeIdSelect = document.getElementById('personal_cost_code_id');
        const employeeIdSelect = document.getElementById('employee_id');

        switch(item){
            case '인건비항목' :
                personalCostCodeIdSelect.disabled=false; businessIdSelect.disabled=true; employeeIdSelect.disabled=true; break;
            case '사업' :
                personalCostCodeIdSelect.disabled=true; businessIdSelect.disabled=true; employeeIdSelect.disabled=false; break;
            case '직원' :
                personalCostCodeIdSelect.disabled=true; businessIdSelect.disabled=true; employeeIdSelect.disabled=false; break;
            case '사업-인건비항목' :
                personalCostCodeIdSelect.disabled=false; businessIdSelect.disabled=false; employeeIdSelect.disabled=true; break;
            case '직원-인건비항목' :
                personalCostCodeIdSelect.disabled=false; businessIdSelect.disabled=false; employeeIdSelect.disabled=true; break;
        }
}
