window.onload = function(event){
    setTableEventListerDefault(document.getElementById('table'));

    document.getElementById('save').onclick= (event)=> saveYearlyCodeUsage();
    setNumberInput(document.getElementById('search-year'));

}

function saveYearlyCodeUsage(){
    const url = '/base/yearly-code-usage/api';
    const createIdList = new Array();
    const deleteIdList = new Array();

    // checkbox 선택된 내역 중 id 없는 것
    // checkbox 해제된 내역 중 id 있는 것

    for (const checkbox of document.querySelectorAll('tbody tr input[type=checkbox]')){
        let tr = checkbox.closest('tr');
        let yearlyCodeUsageId = tr.querySelector('[name=yearly_code_usage_id]');
        let codeId = tr.querySelector('[name=id]');

        if (checkbox.checked && yearlyCodeUsageId == null){
            createIdList.push(codeId.value);
        }
        else if (!checkbox.checked && yearlyCodeUsageId != null){
            deleteIdList.push(yearlyCodeUsageId.value);
        }
    }
    if (createIdList.length == 0 && deleteIdList.length ==0){
        alert('상태가 변경된 데이터가 없습니다.');
        return;
    }

    let formData = new FormData();
    formData.set('year', document.getElementById('year').value);
    formData.set('code_id_list', JSON.stringify(createIdList));
    formData.set('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);

    if (createIdList.length){
        fetchEvent(url, undefined, 'POST', formData, (data)=>{
            alert(data.message);
            if (deleteIdList.length){

                fetchEvent(url, undefined, 'DELETE', {pk_list:deleteIdList}, (data)=>{
                    alert(data.message);
                    location.reload();
                });
            }
        });
    }else if (deleteIdList.length){
        fetchEvent(url, undefined, 'DELETE', {pk_list:deleteIdList}, (data)=>{
            alert(data.message);
            location.reload();
        });
    }

}