window.onload = function(){

    initFileBox(document.querySelector('.file-box').parentElement);
    document.querySelector('.button.save').onclick = (event) => saveData(event);
    setNumberInputCheck(document.getElementById('rate'),{
        min:0,max:100,minLength:0, maxLength:3
    });
    setYearInput(document.querySelector('[name=year]'));
    attachEventToSelectControl();
    // 년도 입력일 경우 귀속 년도만 입력가능하도록 고정 나머지 일자도 동일하게
    // 그리고 날짜가 한번 들어올 때 귀속년도가 없다면 귀속년도 해당 날짜데이터의 년도로 고정
    // 귀속 년도 데이터 변경 시 날짜 데이터 변경
    document.getElementById('type').dispatchEvent(new Event('change'));
    // date_list 에 대한 년도 범위 확인 필요
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
    // 귀속 년도의 경우 맨 마지막에 입력
    // input date 의 데이터 변화 시 귀속 년도의 경우 첫 데이터를 대상으로 진행한다.
    // 귀속 년도 조정 및 일자 등록시 포함 여부 체크
    // 무조건 조정 항목 코드만 가져온다.
    // mutation observer
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


    fetchEvent('/accounting/budget-usage-record-adjustment/api', undefined, 'POST', formData, (data)=>{
        alert(data.message);
        location.href='/accounting/budget-usage-record-adjustment/list/';
    });
}

function attachEventToSelectControl(){
    document.getElementById('type').onchange = (event) => {
        // 조정 대상 선택
        const item = event.target.selectedOptions[0].dataset.item;
        // 항목, 사업, 인물 선택 중 범위 -> 항목 / 항목, 사업 / 항목 사업 인물 / 항목 인물
        // 년 월 일, 기간 선택
        // 사업, 항목, 전체
        const businessIdSelect = document.getElementById('business_id');
        // 사업 선택 시마다 등록된 코드만 나올 수 있도록 해야 한다.
        const budgetCodeIdSelect = document.getElementById('budget_code_id');

        switch(item){
            case '예산' :
                businessIdSelect.disabled = true; budgetCodeIdSelect.disabled = false; break;
            case '사업' :
                businessIdSelect.disabled = false; budgetCodeIdSelect.disabled = true; break;
            case '사업-예산':
                businessIdSelect.disabled = false; budgetCodeIdSelect.disabled = false; break;
        }
        // period selector 의 경우 새로 생성 필요
    }
}