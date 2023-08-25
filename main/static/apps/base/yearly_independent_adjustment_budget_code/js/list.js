
window.onload = function(event){
    setTableEventListerDefault(document.getElementById('table'));
    // 년도 변경에 따라 등록된 예산 과목 가져와야 한다.
    const yearSelector = document.getElementById('year');
    yearSelector.onchange = (event)=>{
        // 당해의 년도별 사용 코드에서 데이터르 가지고 온다.

        const params = {
            year:event.target.value,
            code__category:'예산',
            reference_values:['code__name']
        };

        fetchEvent('/base/yearly-code-usage/api', undefined, 'GET',
            params,
            (data)=>{
            if(data.data){
                const codeList = data.data;
                const optionList = new Array();
                const budgetCodeSelect = document.getElementById('budget_code_id');
                Array.from(codeList).forEach(codeObj=>{

                    optionList.push(
                        `<option value="${codeObj.code_id}">${codeObj.code_name}</option>`
                    );
                });
                budgetCodeSelect.innerHTML= optionList.join('\n');
            }
            });
    }
    yearSelector.dispatchEvent(new Event('change'));


}