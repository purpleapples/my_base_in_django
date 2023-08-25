
function removeDuplicateOptions(select_selector_list){
    for (let selector of select_selector_list){
        let select =document.querySelector(selector);
        Array.from(select.children).forEach((option, index)=>{
            option.setAttribute('index', index);
        });
        select.addEventListener('focus', function(event){
            this.setAttribute('data-previous-index', this.options[this.selectedIndex].getAttribute('index'));
            this.blur();
        });
        select.addEventListener('change', function(event){
            removeDuplicateOption(this, select_selector_list);
        });
    }
}

function removeDuplicateOption(target_select, select_selector_list){
    let previous_data_index = target_select.getAttribute('data-previous-index');
    let restore_option_list = new Array();
    let restore_option = '';
    let remove_value = target_select.value;

    for(let selector of select_selector_list){
        let select = document.querySelector(selector);
        if (select.name == target_select.name){
            restore_option_list = select.options;
            break;
        }
    }

    for(let option of restore_option_list){
        let index = option.getAttribute('index');
        if(index == previous_data_index){
            restore_option = option
            break;
        }
    }

    // 삭제
    if (remove_value != ''){
        for(let selector of select_selector_list){
            let select = document.querySelector(selector);
            if (select.name == target_select.name){continue;}
            if(select.options.length ==1) {continue;}
            for(let option of select.options){
                if(option.value == remove_value){
                    option.remove();
                    break;
                }
            }
        }
    }

    // 복원
    // 삽입하고 정렬하는 걸로
    // 나중에 index 찾는 걸로 변경
    if(restore_option.value !=''){
        for(let selector of select_selector_list){
            let select = document.querySelector(selector);
            if (select.name == target_select.name){continue;}
            select.appendChild(restore_option.cloneNode(true));
            console.log(select.name, select.options.length)
            let option_list = new Array();
            Array.from(select.options).forEach((option)=> {
                option_list.push(option);
            });
            let length = select.options.length-1;
            for(let i = 0; i<length; i++){
                select.options.remove(1);
            }
            option_list = option_list.sort(sortByIndex);
            option_list.forEach((option)=>{
                select.appendChild(option);
            });
        }
    }
}

function sortByIndex(el1, el2){
    let el1_index =parseInt(el1.getAttribute('index'));
    let el2_index =parseInt(el2.getAttribute('index'));
    if (el1_index < el2_index){
        return -1;
    }else if (el1_index < el2_index){
        return 1;
    }else{
        return 0;
    }
}
//--------------------------------------------------------------------------------------------------------------------

function addFormSubmitEvent(form_id, func){
    let form = document.getElementById(form_id);
    form.addEventListener('submit', function(event){
        event.preventDefault();
        return func(this);
    });
}

function setImageByValue(node, target_selector, img_url_parent, attribute_name){
    /*
    * abbr: 선택된 node 의 값을 가지고 해당하는 option에 존재하는 속성으로 img src를 맞춰준다.
    * author: 임성혁(samson siba)
    * param: node:<HtmlSelectElement>, target_selector:String, img_url_parent:String, attribute_name:String
    * desc: 작성 당시 기준으로 node에서 선택된 option이 다른 db object 라 가정한다.
    * 1. 그림을 보여줄 HtmlImgElement를 찾는다.
    * 2. 속성안에 값이 안담겨 있다면 value를 직접 사용하고 아니면 선택된 option의 속성을 찾아서 src에 부착한다.
    *
    * */
    let value = '';
    if(node.type == 'select-one'){
        if(node.value ==''){
            return;
        }
    }
    let img = node.parentNode.parentNode.querySelector(target_selector);
    if(attribute_name==null){
        img.src = img_url_parent + node.value;
    }else{
        img.src= img_url_parent + node.options[node.selectedIndex].getAttribute(attribute_name)
    }

}

function setChildSelectOptions(select, child, dataField){
    // body에 전부 내려 놓기
    // name + 'HiddenOptions
    select.addEventListener('change', function(event){
        let hiddenOptions = '';
        if (document.querySelector(`.${child.name}HiddenOptions`) == undefined){
            hiddenOptions = document.createElement('div');
            hiddenOptions.classList.add(`.${child.name}HiddenOptions`);
            hiddenOptions.classList.add('hidden');
            for (const option of child.options){
                hiddenOptions.appendChild(option);
            }
        }else{
            hiddenOptions = document.querySelector(`.${child.name}HiddenOptions`);
        }
        child.innerHTML = '';

        for (const option of hiddenOptions.children){
            console.log(option.dataset[dataField] == select.value, option.textContent)
            if (option.dataset[dataField] == select.value){
                child.appendChild(option);
            }
        }
    });
}



function setChildSelect(select_node, target_parent_selector, child_node_selector){

    /*
    * abbr: 자식 select 에 대한 option 교체
    * author: 임성혁(samson siba)
    * param: select_node:<HtmlSelectElement>, target_parent_selector:String
    * desc:
    * 1. 부모 select의 선택값을 찾는다.
    * 2. 후보군 selector를 target_parent_selector 와 부모 select의 선택값을 name으로 찾는다.
    * 3. child_select_node를 찾는다.
    * 4. target select의 option으로 child_select 의 option을 교체한다.
    */

    let select_name = select_node.value;
    let target_select = document.querySelector(`${target_parent_selector} [name='${select_name}']`);
    let child_select = document.querySelector(child_node_selector);

    let length = target_select.length;
    for(let i=0; i<length; i++){
        child_select.remove(0);
    }

    if(target_select == null){
        alert('선택된 대상에서는 관련 데이터가 없습니다');
        return;
    }

    for(let option of target_select.options){
        child_select.appendChild(option.cloneNode(true));
    }
}

function checkRequiredIsEmpty(form, check_field_name_list, alert_name_list, callback=undefined){
    let i =0;
    for(let name of check_field_name_list){
        let element = document.getElementsByName(name)[0];
        if (element.value == ''){
            if(element.type == 'file'){
                let file_name_value = document.getElementsByName(name+'_name')[0].value;
                if(file_name_value == '' || file_name_value=='등록된 파일이 없습니다.'){
                    alert(alert_name_list[i] +'값이 비었습니다.');
                    element.focus();
                    return false;
                }
            }else{
                alert(alert_name_list[i] +'값이 비었습니다.');
                element.focus();
                return false;
            }
        }
        i++;
    }
    return true;
}

// table template 경우 사용가능한 함수
function checkRequiredValue(form, required_field_name_list=undefined, alert_name_list=undefined){
    required_field_name_list = required_field_name_list == undefined ? [] : required_field_name_list ;
    alert_name_list = alert_name_list == undefined ? [] : alert_name_list;

    Array.from(document.querySelectorAll('.required-field')).forEach((th)=>{
        required_field_name_list.push(th.nextElementSibling.querySelector('input, select, textarea').name);
        alert_name_list.push(th.textContent);
    });
    if(checkRequiredIsEmpty(form, required_field_name_list, alert_name_list)){
        form.submit();
    }
}

function checkFormat(event, format_object, callback=undefined){
    event.preventDefault();
    let form = event.target;
    // format 특정 element가 format에 맞는지 검사, 특정 keyword는 conventional format 사용
    // conventional format 종류 : type이 number, email인 경우
    // function name 과 type 분석해서 type 혹은 name에 특정 값 email, 사업자 등록 번호, 등이 포함될 경우 담아서 따로 검사 한다.
    let check_names = [];
    // email 에 대한 format 은 사전 지정
    let regEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

    Array.from(Object.keys(format_object)).forEach((name)=>check_names.push(`[name=${name}]`));
    console.log(form.querySelectorAll(check_names.join(',')))
    for(let input of form.querySelectorAll(check_names.join(','))){
        if(input.type='email') {
            if(! regEmail.test(input.value)){
                alert('email 형식이 일치하지 않습니다.');
                input.focus();
                return false;
            }
            continue;
        }
        if(input.type = 'number'){
            // 최고 최저 속성값 확인 이후 해결
            if(input.getAttribute('min') != null && input.value < input.getAttribute('min')){
                alert(input.name + '값 범위 초과, 최소값 :' + input.getAttribute('min') + '최대값 : ' + input.getAttribute('max') );
                input.focus();
                return false;
            }
            if (input.getAttribute('max') != null && input.value > input.getAttribute('max')){
                alert(input.name + '값 범위 초과, 최소값 :' + input.getAttribute('min') + '최대값 : ' + input.getAttribute('max') );
                input.focus();
                return false;
            }
            continue;
        }
        // 검사
        if(! format_object[input.name].test(input.value)){
            alert(input.name + "에서 형식 불일치");
            input.focus();
            return false;
        }
    }

    if (callback != undefined){
        return callback(form);
    }
    else{
        return checkRequiredValue(form);
    }
}


function setInputEnabled(button_node){
    /*
    * abbr: form class에 등록된 속성에 대한 disabled 제어
    * author: 임성혁
    * param: button_node:HtmlButtonElement
    * desc:
    * django의 form_class에 등록된 속성의 경우 required 여부를 떠나서 disabled 되면 에러납니다.
    * 그래서 여기서 form의 disabled 된 속성 전부 풀어줍니다. 이후 전송합니다.
    * */
    let form = button_node.closest('form');
    for(let element of form.elements){
        element.disabled=false;
    }
    form.submit();
}

function changeInputNameNumber(cloneNode, number){
    /*
    * abbr: 복사 node에 대한 name 바꾸기
    * author: 임성혁(samson siba)
    * param: cloneNode:HtmlElement?, number:Number
    * desc:
    * 1.복사한 node가 input node를 가져서 이전 함수에서 호출했습니다.
    * 2.name의 숫자를 찾아서 해당 숫자를 +1 해서 올려줍니다.
    * 3.이후 버튼을 자기 삭제 버튼으로 만들어 줍니다. 추가는 최초 한곳에서만 이루어지고 나머지 버튼은 자기 부모 삭제역할을 합니다.
    * */

    for(let input of cloneNode.querySelectorAll('input, select')){
        input.name = input.name.replace(number, (parseInt(number) +1).toString());
        input.value='';
    }

    let button = document.createElement('span');
    button.classList.add('formBtn');
    button.classList.add('del');
    button.textContent = 'X';
    cloneNode.appendChild(button)
    button.addEventListener('click', function(event){
        deleteNode(this, true, '.additional');
    });
}

function checkNewData(input, target_selector=undefined, attribute_name=undefined){
  /*
  * abbr: input list 입력에 따른 db 일치값/ 신규 값에 대한 setting
  * author: 임성혁(samson)
  * param: input:HtmlInputElement, target_selector: data 저장용 hidden node, option의 data 저장 속성
  * desc:
  * chrome의 datalist는 value를 같이 표기하므로 attribute에 보낼 저장 값을 집어넣고 꺼낸다.
  * 1. input 의 value 와 input의 datalist의 option의 value의 일치 탐색
  * 2. 맞으면 attribute_name을 이용하여 값 추출
  * 3. 대상 selector에 추출한 속성값을 value로 입력
  * */
  let label = input.parentNode.nodeName == 'TD' ? input.closest('tr').querySelector('th') : input.previousElementSibling;
  // 빈값 체크
  let exists = false;
  let data_pk = ''
  if (input.value == ''){
      label.classList.contains('notify-new') ? label.classList.remove('notify-new') : '';
      return;
  }

  Array.from(input.list.options).forEach((option)=>{if(option.value == input.value){exists=true; data_pk=option.getAttribute('data-pk'); return}});

  if (exists){
      label.classList.contains('notify-new') ? label.classList.remove('notify-new') : ''
      if (target_selector != undefined){
          document.querySelector(target_selector).value=data_pk;
      }
  }else{
      !label.classList.contains('notify-new') ? label.classList.add('notify-new') : ''
      if (target_selector != undefined){
          document.querySelector(target_selector).value='';
      }
  }
}

function _eventOnClickUploadFileName(button_node){

    button_node.parentNode.querySelector('[type=file]').click();
}

function _eventOnChangeUploadFile(file_node){

    file_node.parentNode.querySelector('[type=text]').value = file_node.value == '' ? '등록된 파일이 없습니다.'
        :file_node.value.replace(/^.*[\\\/]/, '');

    $(file_node).closest('.filebox').find('[name=DownloadButton]').remove()
}

function fileClear(button_node) {
    let parent = button_node.parentNode;
    parent.querySelector('[type=text]').value ="등록된 파일이 없습니다.";
    button_node.disabled=true;
}

function _eventOnInsideFileBox(){
    for (let div of document.querySelectorAll('.file-box')){
        let file = div.querySelector('[type=file]');
        div.querySelector('[type=file]').addEventListener('change',function(evnet){
            _eventOnChangeUploadFile(this);
        });
        let label = document.querySelector(`[for=${file.id}]`)
        label.addEventListener('click', function(event){
            event.preventDefault();
            event.stopImmediatePropagation()
            _eventOnClickUploadFileName(this);
        })
    }
}


function setInputDisabled(button_node, readonly_list=[]){
    /*
    * abbr: form 입력 모드 통제
    * author: 임성혁(samson siba)
    * param: button_node:HtmlButtonElement, readonly_list:list<String>
    * desc:
    * 한 화면에서 입력, 상세, 수정을 다 본다고 가정한 경우 사용하는 기능입니다.
    * 입력/취소 버튼을 누름에 따라 readonly_list 를 제외하고 입력을 활성/비활성화 합니다.
    */
    let disabled = false;
    if(button_node.textContent == '취소'){
        button_node.textContent = '입력';
        disabled = true;
        button_node.parentNode.querySelector('.save').classList.add('disabled')
    }else{
        button_node.textContent = '취소';
        button_node.parentNode.querySelector('.save').classList.remove('disabled')
    }

    let form = button_node.closest('form');
    for(let element of form.elements){
        if (readonly_list.indexOf(element.name) != -1){continue;}
        if (element.nodeName == "SELECT" || element.nodeName == "BUTTON") {
            element.disabled = disabled;
        }else{
            element.readOnly = disabled;
        }
    }
}

function changeBetweenFileAndDownload(criterion_input){
    /*
    * abbr: file 다운로드 기능 활성/비활성화
    * author: 임성혁(samson siba)
    * param: criterion_input;child_of_form_element
    * desc:
    * 한 화면에서 입력, 상세, 수정이 다 된다고 가정 했을 경우 파일 내려받기 활성/비활성화 입니다.
    * 입력 가능 불가능 여부에 따라 파일 내려받기 기능을 활성/비활성화 합니다.
    * */

    let form = criterion_input.closest('form');
    let downloadLinkList = form.querySelectorAll('.download-link');
    if(criterion_input.readOnly){
        for(let div of downloadLinkList){
            div.previousElementSibling.classList.add('hidden');
            div.classList.remove('hidden');
        }
    }else{
        for(let div of downloadLinkList){
            div.previousElementSibling.classList.remove('hidden');
            div.classList.add('hidden');
        }
    }
}

function readImage(input, img_selector = undefined) {
    const name = input.name;
    const previewImage = img_selector == undefined ? $("#"+name+"-image") : $(img_selector);
    if(input.files && input.files[0]) {
        // 이미지 파일인지 검사 (생략)
        // FileReader 인스턴스 생성
        const reader = new FileReader();
        // 이미지가 로드가 된 경우
        reader.onload = e => {
            previewImage.attr("src",e.target.result);
        }
        // reader가 이미지 읽도록 하기
        reader.readAsDataURL(input.files[0]);
    }else{
        previewImage.attr("src","/static/css/img/preview.jpg");
    }
}

function initializeImageInput(button, file_selector, callback=undefined){
    let image_id = button.parentNode.querySelector(file_selector).name;
    if (callback != undefined){
        callback(button);
    }else{
        document.getElementById(image_id + '-image').src = '/static/css/img/preview.jpg';
    }
}

function removeEmptyValue(event){
    event.preventDefault();
    for (let input of event.target.elements){
        input.disabled = input.value == '';
    }
    event.target.submit();
}

function defaultPost(event, container_selector, url='.'){
    const formData = new FormData();
    for (let input of event.target.closest(container_selector).querySelectorAll('input, select, textarea')){

        if ((input.name =='' || ['submit','reset'].indexOf(input.name) != -1)  || (input.type=='hidden' && input.value =='')){
            continue;
        }
        if(input.type == 'date' && input.value == ''){
            formData.set(input.name, null);
            continue;
        }
        if(input.type == 'checkbox'){
            formData.set(input.name, input.checked ? 'True' : 'False');
            continue;
        }

        formData.set(input.name, input.value);
    }
    formData.set('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);
    fetchEvent(url, undefined, 'POST', formData, (data)=>{
        alert(data.message);
        location.reload();
    })
}

// pair 로 묶어서 진행
function initConnectedSelect(domList){
    for (let i=1; i< domList.length; i++){
        let select = domList[i-1];
        let child = domList[i];
        select.dataset.child=child.name;
        let list = Array.from(child.options).map(x=>{
            return [x.dataset.parentvalue,x.value, x.textContent];
        });
        child.dataset.list = JSON.stringify(list);
        select.onchange = (event)=>{
            const child = document.querySelector(`[name="${event.target.dataset.child}"]`);
            const optionAttributes = JSON.parse(child.dataset.list).filter(x=> x[0] == (event.target.value).toString());
            child.innerHTML=optionAttributes.map(x=>{ return `<option data-parentValue="${x[0]}" value="${x[1]}">${x[2]}</option>`}).join('');
        }
    }
}

function setForm(data, form, appendFunc = undefined){
    for(const el of form.elements){
        if(['csrfmiddlewaretoken',''].indexOf(el.name) != -1 || ['submit','reset'].indexOf(el.type) != -1){
            continue;
        }
        el.value='';
        if (Object.keys(data).indexOf(el.name)!=-1 ){

            if (el.type== 'checkbox'){
                el.checked = data[el.name];
            }else if(el.nodeName=='SELECT'){
                for (const option of el.options){
                    if(option.value == data[el.name]){
                        option.selected=true;
                        break;
                    }
                }
            }else{
                el.value = data[el.name];
            }
        }
    }
    if (appendFunc != undefined){
        appendFunc(data, form);
    }
}

function controlFormElement(container){
    // class input year, input month, input period, input number
    container.querySelectorAll('.input.number').forEach(input=>setNumberInput(input));
    container.querySelectorAll('.input.year').forEach(input=>setYearInput(input));

    // control month
    container.querySelectorAll('.input.month').forEach(input=>setMonthInput(input));

    // control period
    container.querySelectorAll('.input.period').forEach(input=>setPeriodInput(input));
}

function setNumberInputCheck(input, attributes, alertText='형식에서 벗어난 입력값입니다.'){
    for (const [key, value] of Object.entries(attributes)){
        input.setAttribute(key, value);
    }

    input.addEventListener('change', function(event){
        let value = event.target.value;
        const target = event.target;
        if (value == '') {return;}
        value = parseInt(value)
        for (const attribute of ['minLength', 'maxLength', 'min', 'max']){
            if (target.hasAttribute(attribute) && target.getAttribute(attribute) !=''){
                let attributeVal = parseInt(target.getAttribute(attribute));
                console.log(value, attributeVal)
                switch(attribute){
                    case 'minLength':
                        if (value.length < attributeVal){
                            alert(alertText);
                            target.value='';
                            target.focus();
                            return;
                        }
                        break;
                    case 'maxLength':
                        if (value.length > attributeVal){
                            alert(alertText);
                            target.value='';
                            target.focus();
                            return;
                        }
                        break;
                    case 'min' :
                        if (value < attributeVal){
                            alert(alertText);
                            target.value='';
                            target.focus();
                            return;
                        }
                        break;
                    case 'max' :

                        if (value > attributeVal){
                            alert(alertText);
                            target.value='';
                            target.focus();
                            return;
                        }
                        break;
                }
            }
        }
    });
}

function setNumberInput(input){
    const attributes = {};
    for (const attribute of ['minLength', 'maxLength', 'min', 'max']){
        if(input.hasAttribute(attribute) && input.getAttribute(attribute) != ''){
            attributes[attribute] = input.getAttribute(attribute);
        }
    }
    setNumberInputCheck(input, attributes, '지정된 입력 형식을 벗어난 값입니다.');
}

function setMonthInput(input){
    const attributes = {
        minLength:1,
        maxLength:2,
        min:1,
        max:12
    }
    setNumberInputCheck(input, attributes, '월 형식을 벗어난 값입니다.');
}

function setYearInput(input){
    const attributes = {
        minLength:4,
        maxLength:4,
        min:1965,
        max:3000
    }
    setNumberInputCheck(input, attributes, '년 형식을 벗어난 값입니다.');
}

function setPeriodInput(input, alertText='시작값은 끝값을 넘을 수 없습니다.'){
    // 같은 컨테이너 안에서
    input.addEventListener('change', function(event){
        const container = input.parentElement;
        const periodInputList = container.querySelectorAll('.input.period');
        const startInput = periodInputList[0];
        const endInput = periodInputList[1];
        if (startInput.value =='' || endInput.value == ''){
            return;
        }
        if (startInput.value > endInput.value){
            alert(alertText);
            endInput.value = '';
            startInput.focus();
            return;
        }
    });
}

function createMultipleTimeSelectContainer(container,
                                           options=['date','date_range','datetime_range','time_range'],
                                           resultTreat={
                                               setResult : false,
                                               isResultConcat:false,
                                               checkRange:true,
                                               limitRange:null
                                           }

){
    container.style.height = '150px';

    const cssText = 'display:grid; grid-template-rows:20% 20% 20%;grid-gap:15px;';
    const parentContainer = document.createElement('article');
    parentContainer.style.height = 'inherit';
    const inputContainer = document.createElement('section');

    inputContainer.classList.add('input-container');
    parentContainer.style.cssText = cssText;
    const inputSelect = document.createElement('select');
    inputSelect.classList.add('form-element-default');
    inputSelect.name='datetime-select';
    const optionList = new Array();

    options.forEach(date_type =>{
        let option = document.createElement('option');
        option.value = date_type;
        switch(date_type){
            case 'date':
                option.textContent='일';
                optionList.push(option);
                break;
            case 'time':
                option.textContent='시간';
                optionList.push(option);
                break;
            case 'date_range':
                option.textContent='일 범위';
                optionList.push(option);
                break;
            case 'datetime_range':
                option.textContent='일시간';
                optionList.push(option);
                break;
            case 'time_range':
                option.textContent='시간';
                optionList.push(option);
                break;
            }
        }
    )
    optionList.forEach(option => inputSelect.appendChild(option));


    const setResultInput = (event, resultTreat) =>{
        const target = event.target;
        const container = target.closest('.input-container').parentElement;
        const resultInput = container.querySelector('[name=date_list]');
        if (target.value ==''){
            return;
        }
        if (container.querySelector('.button.reset') != undefined){
            if(resultInput.value == ''){
                resultInput.value = target.value;
                target.value = '';
            }else{
                if (isDateInRange(target.value, resultInput.value, resultTreat['limitRange'])){
                    resultInput.value += ',' + target.value;
                    target.value = '';
                    if (target.class.contains('period')){
                        target.parentElement.querySelectorAll('input').forEach(input=> input.value='')
                    }

                }
            }
        }else{
            resultInput.value = target.value;
        }
    }

    const setResultInputFromPeriod = (event, resultTreat) =>{
        const target = event.target;
        const container = target.closest('.input-container').parentElement;
        const periodContainer = target.parentElement;
        if (target.value ==''){
            return;
        }
        const resultInput = container.querySelector('[name=date_list]');
        const startDate = periodContainer.firstElementChild;
        const endDate = periodContainer.lastElementChild;
            if (startDate.value !='' && endDate.value !=''){
                if(startDate.value >= endDate.value){
                    return;
                }else{
                    const value = startDate.value +'~' + endDate.value;
                    if (container.querySelector('.button.reset') != undefined){
                        if (resultInput.value == ''){
                            resultInput.value = value;
                        } else{
                            if(isDateInRange(value, resultInput.value, resultTreat['limitRange'])){
                                resultInput.value += ',' + value;
                            }
                        }
                    }else{
                        resultInput.value = value;
                    }
                }
            }
    }
    // 해당 기능의 경우 위의 모든 경우의 수를 전부 처리 가능해야 한다.

    inputSelect.addEventListener('change', function(event){
        const parent = event.target.parentElement;
        const container = parent.parentElement;
        const selectedValue = event.target.value;
        const defaultCssClassList = ['form-element-default', 'input'];
        const inputContainer = container.querySelector('section.input-container');
        let periodContainer = '';
        let input = '';
        inputContainer.innerHTML = '';

        switch(selectedValue){
            case 'date':
                input = document.createElement('input');
                defaultCssClassList.forEach(classStr=> {input.classList.add(classStr)});
                input.type='date';
                input.classList.add(selectedValue);
                inputContainer.appendChild(input);
                input.addEventListener('change', function(event){
                    setResultInput(event, resultTreat);
                });
                break;
            case 'time':
                input = document.createElement('input');
                defaultCssClassList.forEach(classStr=> {input.classList.add(classStr)});
                input.classList.add(selectedValue);
                input.type='time';
                inputContainer.appendChild(input);
                input.addEventListener('change', function(event){
                    setResultInput(event, resultTreat);
                });
            case 'date_range':
                periodContainer =createPeriodInput('date');
                periodContainer.classList.add(selectedValue);
                inputContainer.appendChild(periodContainer);
                for (const input of  periodContainer.querySelectorAll('input')){
                    input.addEventListener('change', function(event){
                        setResultInputFromPeriod(event, resultTreat);
                    });
                }
                break;
            case 'datetime_range':
                periodContainer =createPeriodInput('date');
                periodContainer.classList.add(selectedValue);
                inputContainer.appendChild(periodContainer);
                for (const input of  periodContainer.querySelectorAll('input')){
                    input.addEventListener('change', function(event){
                        setResultInputFromPeriod(event, resultTreat);
                    });
                }
                break;
            case 'time_range':
                periodContainer =createPeriodInput('date');
                periodContainer.classList.add(selectedValue);
                inputContainer.appendChild(periodContainer);
                for (const input of  periodContainer.querySelectorAll('input')){
                    input.addEventListener('change', function(event){
                        setResultInputFromPeriod(event, resultTreat);
                    });
                }
                break;
        }
    });
    parentContainer.appendChild(inputSelect);
    parentContainer.appendChild(inputContainer);

    if (resultTreat['setResult']){
        const resultInputContainer = document.createElement('section');
        const dateList = document.createElement('input');
        dateList.type='text';
        dateList.name='date_list';
        dateList.classList.add('form-element-default');
        const resultInput = document.createElement('input');
        resultInput.name='date_list';
        resultInput.type='text';
        resultInput.classList.add('form-element-default');
        resultInput.readOnly=true;
        resultInputContainer.appendChild(resultInput);
        resultInputContainer.style.cssText = 'display:grid;grid-template-columns:70%28%;grid-gap:2%;'
        if (resultTreat['isResultConcat']){
            const resetButton = document.createElement('span');
            resetButton.textContent = '선택초기화';
            resetButton.classList.add('button');
            resetButton.classList.add('reset');
            resetButton.onclick = (event)=>{
                event.target.parentElement.children[0].value='';
            }
            resultInputContainer.appendChild(resetButton);
        }
        parentContainer.appendChild(resultInputContainer);
    }
    container.appendChild(parentContainer);
    inputSelect.dispatchEvent(new Event('change'));
}

function createPeriodInput(type){
    const defaultCssClassList = ['form-element-default', 'input'];
    const periodContainer = document.createElement('article');
    const span = document.createElement('span');
    span.textContent = '~';
    periodContainer.classList.add('among');
    const startInput = document.createElement('input');
    const endInput = document.createElement('input');
    startInput.name = 'start_' +type;
    endInput.name = 'end_' + type;
    startInput.type = type;
    endInput.type = type;
    startInput.classList.add('period');
    endInput.classList.add('period');
    setPeriodInput(startInput);
    setPeriodInput(endInput);
    defaultCssClassList.forEach(classStr=> {startInput.classList.add(classStr); endInput.classList.add(classStr)});
    periodContainer.appendChild(startInput);
    periodContainer.appendChild(span);
    periodContainer.appendChild(endInput);
    return periodContainer;
}

function concatSelectedValues(el, input){
    if (input.value == ''){
        input.value = el.value;
    } else{
        input.value = ',' +el.value;
    }
}

const isDateInRange = (value, dateList, limitRange) => {
    /**
     * impossible to recycle
     *
     * in javascript there are 5 types of dateformat to treat
     * 1.yyyy-mm-dd : date
     * 2.yyyy-mm-dd~yyyy-mm-dd : dateRange
     * 3.yyyy-mm-ddTHH:mi:ss : datetime
     * 4.HH:mi:ss : time
     * 5.HH:mi:ss~HH:mi:ss : timeRange
     * 6.yyyy-mm-dd%THH:mi:ss~yyyy-mm-dd%THH:mi:ss : datetimeRange
     * */
    let firstDate = dateList.split(',')[0];
    firstDate = firstDate.indexOf('~') != -1 ? firstDate.split('~')[0] : firstDate;
    let from='';
    let fromStr='';
    let to ='';
    let toStr = '';
    let compareFrom = '';
    let compareTo = '';
    let dateValue = '';
    let range = '';

    const checkDateInRange = (limitRange, rangeValue, testValue) =>{
        let length = 0;
        switch(limitRange){
            case 'year': length=4; break;
            case 'month': length=7; break;
            case 'date': length=10; break;
        }
        rangeValue.toString();
        if (rangeValue.substr(0, length) != testValue.substr(0, length)){
            return false;
        }
        return true;
    }

    if (value.indexOf('~') !=-1){
        const range = value.split('~');
        from = new Date(range[0]);
        to = new Date(range[1]);

        if (limitRange != null){
            if(!checkDateInRange(limitRange, firstDate, range[0])){
                alert('기준 범위를 벗어난 데이터 입니다.');
                return false;
            }
            if(!checkDateInRange(limitRange, firstDate, range[1])){
                alert('기준 범위를 벗어난 데이터 입니다.');
                return false;
            }
        }
    }else{
        dateValue = new Date(value);
        if (limitRange != null){
            if(!checkDateInRange(limitRange, firstDate, value)){
                alert('기준 범위를 벗어난 데이터 입니다.');
                return false;
            }
        }
    }

    for (const dateStr of dateList.split(',')){
        // 기준 설정 : date type 변수를 잡을 지 str type을 잡을 지
        // 범위 비교로 변경
        // 함수화 불가 : 함수를 돌릴 경우 변수준비를 계속 진행해야 한다.
        // 앞단 비교 :
        switch(dateStr.length){
            case 10:
                let date = new Date(dateStr);
                if (value.indexOf('~') !=-1){
                    if (from <= date &&  date <=to){
                        alert('이미 등록된 일자에 포함되어 있습니다.');
                        return false;
                    }
                }else{
                    if (date === dateValue){
                        alert('이미 등록된 일자 입니다.');
                        return false
                    }
                }
                break;
            case 21:
                    range = dateStr.split('~');
                    compareFrom = new Date(range[0]);
                    compareTo = new Date(range[1]);
                if (value.indexOf('~') !=-1){
                    if ((from <= compareFrom && compareFrom <= to) || (from <= compareTo && compareTo <= to )){
                        alert('이미 등록된 범위에 값이 포함되어 있습니다.');
                        return false;
                    }
                }else{
                    if(compareFrom <= dateValue && dateValue <= compareTo){
                        alert('이미 등록된 범위에 값이 포함되어 있습니다.');
                        return false;
                    }
                }
                break;
        }
    }
    return true;
}
