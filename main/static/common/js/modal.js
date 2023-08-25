function deleteRowDefault(button_node){

    let modal = button_node.closest('.modal');
    let pkList = JSON.parse(modal.querySelector('[name=pkList]').value);
    const url = modal.querySelector('[name=url]').value;

    fetchEvent(url,undefined, 'delete', {'pk_list':pkList}, (data)=>{
        alert(data.message);
        if (Object.keys(data).indexOf('redirect_url') != -1){
           location.href=data.redirect_url;
        }else{
            location.reload();
        }
        });
}

function deleteDefault(button_node){

    let modal = button_node.closest('.modal');
    let id = modal.querySelector('[name=id]').value;
    const url = modal.querySelector('[name=url]').value;

    fetchEvent(url,undefined, 'delete', {'id':id}, (data)=>{
        alert(data.message);
        if (Object.keys(data).indexOf('redirect_url') != -1){
           location.href=data.redirect_url;
        }else{
            location.reload();
        }
        });
}

function deleteModalShow(container, id, url='.'){

    const modal = container.querySelector('.delete-modal');
    modal.querySelector('[name=id]').value = id;
    modal.querySelector('[name=url]').value = url;
    $(modal).css('display','flex').children('.modal-content').animate({
        marginTop : "0"
    },400);
}


function deleteRowsModalShow(node, modalSelector='#delete-rows-modal', url='.'){

    const modal = document.querySelector(modalSelector);
    let selectedRow = document.querySelectorAll("#" +node.id.split('-')[0] + ' tbody tr.is_chk input[name=id]');
    let pkList = new Array();
    if(selectedRow.length == 0){
        alert('선택된 목록이 없습니다.');
        return;
    }
    Array.from(selectedRow).forEach((input)=>{
        pkList.push(input.value);
    });

    modal.querySelector(modalSelector +' [name=pkList]').value = JSON.stringify(pkList);
    modal.querySelector('[name=url]').value = url;
    $(modal).css('display','flex').children('.modal-content').animate({
        marginTop : "0"
    },400);
}

function closeDeleteModal(button_node){

    $(button_node.closest('.modal')).css('display','none').children('.delete-modal-content').animate({
        marginTop : "50px"
    },400);
}


function showModal(modal, modalType='center'){

    modal = typeof modal == 'string' ? document.querySelector(modal) : modal;

    const modalContent = modal.querySelector('.modal-content');
    switch(modalType){
        case 'center': modalContent.classList.add('center');break;
        default:
            modalContent.classList.add('center');
            break;
    }
    modal.style.display='flex';
}

function showFixedModal(modal_selector, top, left){
    const modal = document.querySelector(modal_selector);
    const modalContent = modal.querySelector('.modal-content');
    modal.style.display='flex';
    modalContent.style.top = top +'px';
    modalContent.style.left = left + 'px';
}

function closeModal(button, pass_message, callback){
    let modal = button.closest('.modal');

    $(".modal").css('display','none').children('.modal-content').animate({
        marginTop : "50px"
    },400);

    if(callback != undefined && pass_message){
        callback(modal.querySelector('textarea').value);
    }
}

function writeEditModal(modal,
                        url,
                        title='수정 화면',
                        table_name,
                        pk,
                        history=undefined,
                        historyFields = undefined,
                        fieldDescriptionList=[], defaultParams=undefined){
    // table id
    const inputBody = modal.querySelector('#input-body');
    const innerHtml = new Array();
    let additionalHeight = 0;
    modal.querySelector('[name=table_name]').value = table_name;
    if (pk != undefined){
        modal.querySelector('[name=id]').value = pk;
    }
    if(defaultParams != undefined){
        modal.querySelector('[name=defaultParams]').value = JSON.stringify(defaultParams);
    }
    modal.querySelector('[name=url]').value = url;
    modal.querySelector('#edit-modal-title').textContent = title;

    const modalContent = modal.querySelector('.modal-content');
    const historyTableBody = modal.querySelector('#edit-history tbody');

    if (history != undefined ){

        historyTableBody.innerHTML =
            history.map(data=> {
                let date = new Date(data.create_dt);
                return `<tr><td>${data.access_log_account_name}</td><td>${ date.getFullYear() +'-' +date.getMonth()+'-' + date.getDate()}</td>`
                    + historyFields.map(field => `<td>${data.record_dict[field]}</td>`).join('') + '</tr>';
            }).join('');
    }else{
        modal.querySelector('#history-section').innerHTML = '';
    }

    // <table> panel

    for (const fieldInfo of fieldDescriptionList){
        let fieldHtml = new Array();
        switch(fieldInfo['type']){
            case 'text':
                fieldHtml.push(`<tr><th><label>${fieldInfo['label']}</label></th>`);
                fieldHtml.push(`<td><input type="text" class="form-element-default" name=${fieldInfo['name']} /></td></tr>`);
                break;
            case 'number':
                fieldHtml.push(`<tr><th><label>${fieldInfo['label']}</label></th>`);
                fieldHtml.push(`<td><input type="number" class="form-element-default" name=${fieldInfo['name']} /></td></tr>`);
                break;
            case 'textarea':
                fieldHtml.push(`<tr><th><label>${fieldInfo['label']}</label></th>`);
                fieldHtml.push(`<td><textarea class="form-element-default" name=${fieldInfo['name']}></textarea></td></tr>`);
                break;
            case 'datetime':
                fieldHtml.push(`<tr><th><label>${fieldInfo['label']}</label></th>`);
                fieldHtml.push(`<td><input type="datetime-local" class="form-element-default" name=${fieldInfo['name']} /></td></tr>`);
                break;
            case 'select':
                fieldHtml.push(`<tr><th><label>${fieldInfo['label']}</label></th>`);
                let select = document.createElement('select');
                select.name = fieldInfo.name;
                select.classList.add('form-element-default');
                select.innerHTML = fieldInfo['options'].map(option => `<option value="${option[0]}">${option[1]}</option>` ).join('');
                fieldHtml.push(select);
                fieldHtml.push(`<td>${select}</td></tr>`);
                break;
        }
        innerHtml.push(fieldHtml.join(''));
        if (history != undefined){
            additionalHeight += history.length * 90;
        }
    }
    inputBody.innerHTML = innerHtml.join('');
    additionalHeight += 60 * (innerHtml.length-1);

    modalContent.style.height = 350 +  additionalHeight + 'px';
    showModal(modal, 'center');
}
// patch data with
function saveWithOutdatedRecord(target){
    const modal = target.closest('.modal');
    const editSection = modal.querySelector('#edit-section');
    const defaultParams = modal.querySelector('[name=defaultParams]').value;
    const formData =  new FormData();
    formData.set('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);
    for(const el of editSection.querySelectorAll('input, select, textarea')){
        if (el.name == 'defaultParams'){
            continue;
        }
        if (el.type == 'checkbox'){
            formData.set(el.name, el.checked);
            continue;
        }
        formData.set(el.name, el.value);
    }
    if (defaultParams != ''){

        for(const[key, value] of Object.entries(JSON.parse(defaultParams))){
            formData.set(key, value);
        }
    }
    if(modal.querySelector('#history-section').innerHTML != ''){
        formData.set('save_outdated_record', '');
    }
    const url = modal.querySelector('[name=url]').value;
    fetchEvent(url, undefined, 'POST', formData, (data)=>{
        alert(data.message);
        if (Object.keys(data).indexOf('redirect_url') == -1){
            location.reload();
        }else{
            location.href = data['redirect_url'];
        }
    });
}