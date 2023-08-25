window.onload = function(){
    _eventOnTabTemplate('.tab-container');
    document.getElementById('download').onclick = (event)=>{
        downloadTempFile('/accounting/budget-usage-record/api/download/labor-productivity',
    {year:document.getElementsByName('year')[0].defaultValue}
    );
}
}