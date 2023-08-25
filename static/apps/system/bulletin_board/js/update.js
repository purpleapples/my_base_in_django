window.onload = function(){

    initFileBox(document.querySelector('.file-box').parentElement);
    document.querySelector('.button.save').onclick = (event) => saveData(event)
}

function saveData(event){
    const form = document.getElementById('form');
    const formData = new FormData(form);
    fetchEvent('/system/bulletin-board/api', undefined, 'POST', formData, (data)=>{
        alert(data.message);
        location.href='/system/bulletin-board/list/'
    })
}
