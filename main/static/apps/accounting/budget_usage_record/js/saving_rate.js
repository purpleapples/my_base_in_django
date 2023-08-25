window.onload = function(){
    setStickyPosition(document.getElementById('table'), [0]);

    document.getElementById('download').onclick = (event)=>{
        downloadTempFile('/accounting/budget-usage-record/api/saving-rate', {year:document.getElementById('table').children[1].firstElementChild.children[1].textContent});
    }
}
