window.onload = function(){

    document.querySelectorAll('.editable-cell').forEach(td=>{
        td.addEventListener('click', _eventOnClickEditableCell);
    });
    setStickyPosition(document.getElementById('table'), [0,1]);
    document.getElementById('download').onclick = (event) => {
        const businessSelect = document.querySelector('[name=business_id]');
        const year = document.querySelector('[name=year]').defaultValue;
        const params = {
            year:year,
            business_id:businessSelect.value
        }
        downloadTempFile('/accounting/business-program-monthly-usage-record/api/download/list',params);
    }

    // file broken
    // document.getElementById('download').onclick = (event) => {
    //     const businessSelect = document.querySelector('[name=business_id]');
    //     const year = document.querySelector('[name=year]').defaultValue.toString();
    //     console.log(businessSelect.options[businessSelect.selectedIndex].textContent)
    //     const name = year + '년 ' + businessSelect.options[businessSelect.selectedIndex].textContent.trim();
    //
    //     exportTableToExcelDefault(document.getElementById('table'), [], [], name)
    // }
}

// cell edit click 에 대한
function _eventOnClickEditableCell(event){

    const tr = event.target.closest('tr');
    const programName = tr.children[1].textContent;
    const year = document.querySelector('[name=search_year]').value;
    const childrenIndex = Array.from(tr.children).indexOf(event.target) -2;
    const headerColumn = document.querySelector('thead tr:last-child').children[childrenIndex];
    const dataField = headerColumn.dataset.field;
    let editModalTitle = '';
    const outdatedRecordParams = {
        table:'',
        record_pk:'',
        reference_values:['access_log__account__name']
    };
    let restUrl = '';
    let historyField = [dataField];
    let fieldDescriptionList = [{label:headerColumn.textContent, name:dataField, type:'number'}];
    const params = {
        program_id:tr.dataset.programId,
        year: year
    };

    if (['figure', 'income'].indexOf(dataField) !=-1){
        // business_program_monthly_usage_record update
        const month = headerColumn.dataset.month;
        params['month'] = month;
        outdatedRecordParams['table'] = 'business_program_monthly_usage_record';
        editModalTitle = year.toString() + '년 ' + programName +' ' + month.toString() + ' 월 수정 이력';
        restUrl ='/accounting/business-program-monthly-usage-record/api'
    }else{
        // business_program_yearly_goal update
        outdatedRecordParams['table'] = 'business_program_yearly_goal';
        editModalTitle = year.toString() + '년 ' + programName +' ' + headerColumn.textContent + '  수정 이력';
        restUrl ='/accounting/business-program-yearly-goal/api'
    }

    fetchEvent(restUrl, undefined, 'GET', params, (data)=>{
        if (data.data){
            const record = data.data[0];
            outdatedRecordParams['record_pk'] = record['id'];
            // outdated_record 는 변경 시 특정 field를 선택할 수 있도록 한다.
            fetchEvent('/system/outdated-record/api', undefined, 'GET', outdatedRecordParams,
                (data)=>{
                    data = Object.keys(data).indexOf('data') != -1 ? data.data : undefined;
                    writeEditModal(document.getElementById('edit-modal'), restUrl,
                        editModalTitle, outdatedRecordParams['table'], record['id'],
                        data, historyField, fieldDescriptionList);
                });
        }else{
            writeEditModal(document.getElementById('edit-modal'), restUrl,
                        editModalTitle, outdatedRecordParams['table'], record['id'],
                        data, historyField, fieldDescriptionList);
        }
        });
}