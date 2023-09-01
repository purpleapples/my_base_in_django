window.onload = function(){
    _eventOnTabTemplate('.tab-container');
    const menuSaveButton = document.getElementById('menu-save-button');
    menuSaveButton.onclick = (event)=> saveMenu(event);

    document.getElementById('is-screen').onclick = (event)=>{
        const idList = ['url', 'screen-id','user-comment'];
        if(event.target.checked){
            for(const idStr of idList){
                const el = document.getElementById(idStr);
                el.disabled=false;
                el.required=true;
                el.closest('tr').classList.remove('hidden');
            }
        }else{
            for(const idStr of idList){
                const el = document.getElementById(idStr);
                el.disabled=true;
                el.required=false;
                el.closest('tr').classList.add('hidden');
            }
        }
    }

    createTree(
        JSON.parse(document.querySelector('[name=object_list]').value),
        document.getElementById('tree-container'),
        {
            direction:'vertical',
        }, {
            textAttribute:'title',
            field_list:['is_screen'],
            classList:['content-arrow-down', 'box-shadow-below-diagonal'],
            callbacks:{
                click:menuClickCallback,
                create:createCallback,
                delete:deleteFunc
            },
        },
        true
    );

    document.querySelector('[name=title]').addEventListener('focusout', function(event){
        const form = event.target.closest('form');
        if (form.nodeIndex.value != ''){
            document.querySelector(`[data-node-index='${form.nodeIndex.value}'] span`).textContent = event.target.value;
        }
    });
}

const menuClickCallback = (event) => {
    /**
     * description : 수정 데이터 저장 및 관련데이터(menu, menu-permission) 조회 및 form 수정사항 treeDataset에 저장
     * - 조건에 대해서는 각 함수에서 알아서 실행한다. 해당 영역에서는 함수만 호출한다.
     * */
    const selected = event.target;

    if  ( ! selected.classList.contains('selected')){
        return;
    }

    const node = selected.closest('li');
    const [key, nodeIndex] = getTreeDataKeys(node);
    const nodeDataset = getTreeData(key)[nodeIndex];

    const menuUrl = '/menu/api';
    const permissionUrl = '/menu/menu-permission/api';

    if (Object.keys(nodeDataset).indexOf('id') == -1){
        document.querySelector('[data-name=permission]').classList.add('hidden');
        if (Object.keys(nodeDataset).indexOf('menu') == -1){
            nodeDataset['menu'] = JSON.parse(JSON.stringify(nodeDataset));
            if (Object.keys(node.dataset).indexOf('parentIndex') != -1){
                nodeDataset['menu']['parent_title']= getTreeData(key)[node.dataset.parentIndex]['menu']['title'];
            }
        }
    }else{
        document.querySelector('[data-name=permission]').classList.remove('hidden');
        document.querySelectorAll('[name=menu_id]').forEach(input=> input.value = nodeDataset['id']);
    }
    setTreeForm(menuUrl, nodeDataset, 'menu', key,
        {id:nodeDataset['id'], reference_values:['parent__title']}, document.getElementById('menuForm'));

    // row에 relation_id를 어떻게 저장하는것이 옳은가?

    setTreeRows(permissionUrl, nodeDataset, 'menu-permission', key,
        {
        menu_id:nodeDataset['id'],
        reference_values: ['account__name']
        }, document.getElementById('menu-permission-tbody'),
        [
            'account_name'
        ],
        ['id','menu_id','duty_code_id'],
        true,
        '/menu/menu-permission/api');
    setTimeout(
        ()=>{
            const isScreen = document.querySelector('[name=is_screen]');
            isScreen.dispatchEvent(new Event('click'));
        }, 150
    )

    const deleteTarget =document.querySelectorAll('span.selected');
    document.querySelector('.delete').disabled = deleteTarget.length == 0;
}

const deleteFunc = (event)=>{

    let deleteTarget =document.querySelector('span.selected');

    if(deleteTarget == undefined){
        alert('선택된 내역이 없습니다.');
    }

    deleteTarget = deleteTarget.closest('li');

    if(Object.keys(deleteTarget.dataset).indexOf('id') == -1){
        deleteTarget.remove();
        return;
    }
    const modal = document.getElementById('delete-rows-modal');
    const pkList = new Array();
    pkList.push(deleteTarget.dataset.id);
    modal.querySelector('[name=pkList]').value = JSON.stringify(pkList);
    modal.querySelector('[name=url]').value = '/menu/api/';
    showModal('#delete-rows-modal');
}

const createCallback = (li) => {
        const [key, index] = getTreeDataKeys(li);
        const treeData = getTreeData(key)[index];
        treeData['title'] = '새 메뉴';
        setNodeDataset(treeData, key, index);
    }

const saveMenu = (event) => {
        const form = event.target.closest('form');
        if( form.nodeIndex.value == ''){
            return;
        }

        for (const deleteCandidateSelector of ['id','parent_id']){
            let el = form.querySelector(`[name=${deleteCandidateSelector}]`);
            if (el != undefined){
                if(el.value == ''){
                    el.disabled=true;
                }
            }
        }
        const formData = new FormData(form);

        for (const el of form.elements){
            if (el.required && el.value == ''){
                alert('필수 항목이 입력되지 않았습니다.');
                el.focus();
                return;
            }
            if (el.type=='checkbox'){
                formData.set(el.name, el.checked ? 'True' : 'False');
            }
        }

        formData.set('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);
        if(form.parentIndex.value != ''){
            formData.set('parent_id', document.querySelector(`[data-node-index='${form.parentIndex.value}']`).dataset['id']);
        }
        fetchEvent('/menu/api/', undefined, "POST", formData, (data)=>{
            alert(data.message);
            location.reload();
        });
    }

