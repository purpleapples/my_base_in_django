window.onload = function(){
    setTableEventListerDefault(document.getElementById('table'));
}

function endPeriod(button){
    const params = {
        id:button.closest('tr').querySelector('[name=id]').value,
        terminate:true
    };
    fetchEvent('/accounting/accounting-input-period/api', undefined, 'POST', params,
        (data)=>{
            alert(data.message);
            location.reload();
        });
}