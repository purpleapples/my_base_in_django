window.onload = function(){
    setTableEventListerDefault(document.getElementById('menu-table'));

    Array.from(document.querySelectorAll('[name=use]')).forEach(checkbox=>{
        checkbox.onclick = (event) => toggleRowCheckboxes(event);
    });
    Array.from(document.querySelectorAll('[name=check_all_checkbox]')).forEach(checkbox=>{
        checkbox.onclick = (event) => checkAllRowCheckbox(event);
    });
    document.getElementById('save').onclick = (event) => savePermission(event);
    Array.from(document.querySelectorAll('[name=use]')).forEach(
        checkbox => checkbox.dispatchEvent(new Event('click'))
    );
}

const savePermission = (event) =>{
    const menuTable = document.getElementById('menu-table');
    const infoTable = document.getElementById('info-table');
    const menuList = new Array();
    const formData = new FormData();
    formData.set('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value)
    for  (const name of ['group_name', 'comment']){
        let input = infoTable.querySelector(`[name='${name}']`);
        if (input.required && input.value ==''){
            alert('해당 값은 비어서는 안됩니다.');
            input.focus();
            return;
        }
        formData.set(input.name, input.value.trim());
    }
    const idHidden = infoTable.querySelector('[name=id]');
    if (idHidden != undefined){
        formData.set('id', idHidden.value);
    }
    for (const checkbox of menuTable.querySelectorAll('[name=use]:checked')){
        const tr = checkbox.closest('tr');
        const data = {
            menu_id:tr.querySelector('[name=id]').value
        };
        const checkboxList =tr.querySelectorAll('[type=checkbox]:not([name=use]):not([name=check_all_checkbox]):checked');
        if (checkboxList.length == 0){
            alert(tr.children[2].textContent + '화면의 기능이 선택되지 않았습니다.\n 기능은 하나라도 선택되어야 합니다.');
            return;
        }
        Array.from(checkboxList).forEach(checkbox => data[checkbox.name] = true);
        menuList.push(data);
    }

    formData.set('menu_permission_list', JSON.stringify(menuList));

    fetchEvent('/menu/menu-permission-group/api', undefined, 'POST', formData, (data)=>{
        alert(data.message);
        location.href = data.redirect_url;
    });


    // 권한 설정 후 menu-permission bulk create
    // 이전 데이터 검증
    // permission bulk create
}

const checkAllRowCheckbox = (event) =>{
    const checkbox = event.currentTarget;
    const tr = checkbox.closest('tr');
    const checked = checkbox.checked;
    Array.from(tr.querySelectorAll('input[type=checkbox]:not([name=use]):not([name=check_all_checkbox])')).forEach(checkbox =>{
       checkbox.checked = checked;
    });
}

const toggleRowCheckboxes = (event) =>{
    const checkbox = event.currentTarget;
    const tr = checkbox.closest('tr');
    const checked = checkbox.checked;
    Array.from(tr.querySelectorAll('input[type=checkbox]:not([name=use])')).forEach(checkbox =>{
       checkbox.disabled = !checked;
    });
}