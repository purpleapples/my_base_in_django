window.onload = function(){
    document.getElementById('download').onclick =(event)=>{
        const output_type_code = event.target.closest('tr').querySelector('select').value;
        const formData = new FormData();
        formData.set('output_type_code', output_type_code);
        formData.set('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value);
        fetchEvent('/menu/project-output/api', undefined, 'POST',
            formData, (data)=>{
                const a = document.createElement('a');
                a.download = data.file_name;
                a.href = data.file_url;
                a.click();
                a.remove();
            })
    }
}
