
window.onload = function(event){

    setYearInput(document.querySelector('[name=year]'));
    const orderNum = document.querySelector('[name=order_num]');
    orderNum.setAttribute('max', 100);
    orderNum.setAttribute('min', 1);
    setNumberInput(orderNum);
    const numberAttributes = {
        min:0,
        max:10000
    }
    document.querySelector('tbody').querySelectorAll('.input.month').forEach(input =>{
        setNumberInput(input,numberAttributes);
    });
    document.querySelector('.button.save').onclick = (event)=>{
        const formData = new FormData();
        for(const el of document.querySelectorAll('input, select')){
            if (el.required && el.value == ''){
                alert('필수값은 비어서는 안됩니다.');
                el.focus();
                return;
            }
            formData.set(el.name, el.value);
        }

        fetchEvent('/accounting/yearly-monthly-first-last-employee-statistic/api', undefined, 'POST',
            formData, (data)=>{
            alert(data.message);
            location.reload();
            })
    }

}