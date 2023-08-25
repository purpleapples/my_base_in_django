$(document).ready(function() {
    setTableEventListerDefault(document.getElementById('table'));

});

const forceLogout = (button) => {

    const username = button.closest('tr').querySelector('td:first-child').textContent.trim()
    const params ={
        username: username
    } ;

    fetchEvent('/system/account/force-logout', undefined, 'PATCH', params, (data)=>{
        alert(message);
        location.reload();
    });
}
