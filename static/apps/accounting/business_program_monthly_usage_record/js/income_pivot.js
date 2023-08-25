window.onload = function(){
    setYearInput(document.querySelector('[name=year]'));

    document.getElementById('download').onclick = (event)=>{

        downloadTempFile('/accounting/business-program-monthly-usage-record/api/download/income',
            {year:document.querySelector('[name=year]').defaultValue});
    }
}