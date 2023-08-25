window.onload = function(){

}
const updateUserComment = (element) => {
    const tr = element.closest('tr');
    const formData = new FormData();
    formData.set('id', tr.querySelector('[name=pk]').value);
    formData.set('user_comment', tr.querySelector('[name=user_comment]').value);
    formData.set('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);

    fetchEvent('menu/screen/api', undefined, 'POST', formData, (data)=>{
        alert(data.message);
        location.reload();
    })
}