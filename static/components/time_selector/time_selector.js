
let cssText = '' +
    '    display: block;\n' +
    '    width: 100%;\n' +
    '    height: 34px;\n' +
    '    padding: 6px 12px;\n' +
    '    font-size: 14px;\n' +
    '    line-height: 1.42857143;\n' +
    '    color: #555;\n' +
    '    background-color: #fff;\n' +
    '    background-image: none;\n' +
    '    border: 1px solid #ccc;\n' +
    '    border-radius: 4px;\n' +
    '    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);\n' +
    '    box-shadow: inset 0 1px 1px rgba(0,0,0,.075);'

let betweenCssText = '    display:flex;\n' +
    '    gap:10px;\n' +
    '    border:0 !important';

const selectedDateList = new Array();
function createTimeSelector(dateTypeList, cssInfo = undefined, is_addable=false){
    // dom 생성 후 반환
    const container = document.createElement('article');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    const typeSelectContainer = document.createElement('section');
    if (cssInfo != undefined && Object.keys(cssInfo).indexOf('cssText') != -1){
        cssText = cssInfo['cssText'];
        betweenCssText = cssInfo['betweenCssText'];
    }
    const typeSelect = createDateSelect(dateTypeList);
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'none';
    for (const type of dateTypeList){
        createDateInput(type['type']).onchange = (event) => _eventOnChangeDate(event, is_addable);
        inputContainer.push(createDateInput(type['type']));
    }

    typeSelectContainer.appendChild(typeSelect);
    container.appendChild(inputContainer);
    container.appendChild(typeSelectContainer);

}

function _eventOnChangeDate(event, is_addable){
    let saveValue = '';
    if(event.name.split('-')[1]  == 'start'){
        const parent = event.target.parentElement;
        let start = '';
        let end = '';
        for(const el of parent.querySelectorAll('input')){
            if (el.name.indexOf('start') != -1){
                start = el.value;
            }else{
                end = el.value;
            }
        }
        if (start < end) {
            alert('시작 값은 끝 값보다 작아야 됩니다.');
            return;
        }
        if(start =='' || end ==''){
            alert('시작값, 종료값은 둘다 채워져야합니다.');
            return;
        }
        saveValue = start +'~' + end;
    } else{
        if (event.target.value != ''){
            saveValue = event.target.value;
        }
    }
    if(is_addable){
        // 헤딩 빔위 범주가 값에 들어가 있다면 alert 창 하고 값 초기화
        if(saveValue.indexOf('~') != -1){
            let start = saveValue.split('~')[0]
            let end = saveValue.split('~')[1]
            for (const val of selectedDateList){
                // month, year, date, datelocal 비교
                if (val.indexOf('~') != -1){
                    if ( start >val.split('~')[0] || start > val.split('~')[1]){
                        alert('이미 등록된 날짜 범위가 있습니다.');
                        return;
                    }
                    if( end < val.split('~')[1]){
                        alert('이미 등록된 날짜 범위가 있습니다.');
                        return;
                    }
                }else{

                }
                // 범주 확인 방법
                // 들어갈 값이 범위값 이면 split
            }
        }else{
            for (const val of selectedDateList){
                if (val.indexOf('~') != -1){
                    let start = val.split('~')[0]
                    let end = val.split('~')[1]

                }else{

                }
                // 범주 확인 방법
                // 들어갈 값이 범위값 이면 split
            }
        }
    } else{
        selectedDateList[0](event.value);
    }
}

function compareDate(target, control){
    // year , month, date, datetime, time
    //
    const format = {
        'year':['YYYY','YY'],
        'month':['YYYY-MM','YY-MM'],
        'date':['YYYY-MM-DD', 'YY-MM-DD'],
        'datetime':['YYYY-MM-DD HH:mm a', 'YY-MM-DD HH:mm a'],
        'time':['HH:mm a']
    }
    for (const value of Object.values(format)){
        if(moment(target, value, true).isValid()){
            target = moment(target, value, true)
            break;
        }
    }
    for (const value of Object.values(format)){
        if(moment(control, value, true).isValid()){
            control = moment(control, value, true)
            break;
        }
    }
    if (target < control){
        return 1
    }else if (target == control){
        return 0
    }else{
        return -1
    }
}

function getSelectedDateList(){
    return selectedDateList;
}

function createDateSelect(dateTypeList, customCssText=undefined){
    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = cssText;
    typeSelect.innerHTML = dateTypeList.map(type=> `<option value="${type['type']}">${type['text']} </option>`).join('');
    return typeSelect;
}

function createDateInput(type, customCssText = undefined){
        let input = ''
        type= type['type'];
        switch(type){
            case 'year':
                input = '<input type="number" name="select-year">';
            case 'month':
                input = '<input type="number" name="select-year">';
            case 'date': input = '<input type="number" name="select-year">';
            case 'datetime': input = '<input type="number" name="select-year">';
        }
        if (['year','month','date','datetime'].indexOf(type) != -1){
            input.style.cssText = cssText;
            return input;
        }else{
            // 버튼은 선택과 추가를 놓는다.
            type = type.split('-');
            const inputContainer = `<div></div>`
            inputContainer.style.cssText=betweenCssText;
            const input1 = document.createElement('input');
            const input2 = document.createElement('input');
            const among = document.createElement('span');
            among.textContent = ' ~ ';
            input1.type=type[0];
            input2.type=type[0];
            input1.name=type[0] + '-start';
            input1.name=type[0] + '-end';
            input1.style.cssText = cssText;
            input2.style.cssText = cssText;

            inputContainer.appendChild(input1);
            inputContainer.appendChild(among);
            inputContainer.appendChild(input2);
            return inputContainer
        }
    // container에 hidden 으로 숨겨둔다.
}