window.onload = function(){
    document.getElementById('form').addEventListener('submit', function(event){
       event.preventDefault();
       if(!checkRequiredValue(this)){return;}
       fetchEvent('.', undefined, 'POST', new FormData(this));
    });
}