
window.onload = function(){
    if (document.getElementById('delete') !== null){
        document.getElementById('delete').onclick = (event) =>
        deleteModalShow(document.body, document.getElementById('id').value, '/system/business-monthly-record-adjustment/api');
    }
}