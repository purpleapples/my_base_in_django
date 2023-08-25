
window.onload = function(event){
    setTableEventListerDefault(document.getElementById('table'));
    setYearInput(document.getElementById('year'));
    const numberDefault = {
        'max':100,
        'min':0
    }
    document.querySelectorAll('input.number').forEach(
        input=>{
            for (const [key, value] of Object.entries(numberDefault)){
                input.setAttribute(key, value);
            }
            setNumberInput(input);
        }
    )
}