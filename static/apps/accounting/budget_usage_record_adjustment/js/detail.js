
window.onload = function(){
    if (document.getElementById('delete') !== null){
        document.getElementById('delete').onclick = (event) =>
        deleteModalShow(document.body, document.getElementById('id').value, '/system/budget-usage-record-adjustment/api');
    }
}