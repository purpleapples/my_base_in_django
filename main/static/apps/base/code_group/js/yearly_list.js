
window.onload = function(event){
    setTableEventListerDefault(document.getElementById('table'));
    const yearSelector = document.getElementById('year');
    yearSelector.onchange = (event)=>{
        // 당해의 년도별 사용 코드에서 데이터르 가지고 온다.

        const category  = document.querySelector('[name=category]');
        const params = {
            year:event.target.value,
            reference_values:['code__name']
        };

        if ('category' == 'budget'){
          params['code__category'] = '예산'
        }
        fetchEvent('/base/yearly-code-usage/api', undefined, 'GET',
            params,
            (data)=>{
            if(data.data){
                const codeList = data.data;
                const optionList = new Array();
                const belongedCodeSelect = document.getElementById('belonged_code_id');
                Array.from(codeList).forEach(codeObj=>{

                    optionList.push(
                        `<option value="${codeObj.code_id}">${codeObj.code_name}</option>`
                    );
                });
                belongedCodeSelect.innerHTML= optionList.join('\n');
            }
            });
    }
    yearSelector.dispatchEvent(new Event('change'));
}