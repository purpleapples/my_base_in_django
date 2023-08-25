window.onload = function(){
    _eventOnTabTemplate('.tab-container');
    document.getElementById('download').onclick = (event) => {
        const params = {
            year:document.querySelector('[name=year]').defaultValue
        }
        downloadTempFile('/accounting/settlement-record/api/download/personal-facility-management-performance-review',params);
    }
}