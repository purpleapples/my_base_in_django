treeOptions = {};
nodeOptions = {};
treeDataset = {};
// 호출 순서대로 key 지정 필요 홤수 별 고유 key 값 확인 필요
// done
// hierarchy structure
// to do
// binary tree
// start
// hierarchy structure table
// update - nodeOption -> callback -> click

function createTree(data,
                    container,
                    treeOption={},
                    nodeOption={},
                    is_node_editable=true,
                    useDataset = false,
                    sort=false,
                    datasetAttributes =['id','parentIndex', 'rootId', 'level', 'nodeIndex','order'],
                    leafNodeType='span')
    {
    if (useDataset){
        treeDataset[container.id] = {
            'container':container,
            'datasetAttributes':datasetAttributes
        };
    }
    const key = container.id;
    //************************************************** set global attributes ***************************************//
    if (Object.keys(nodeOption).indexOf('textAttribute') == -1 ||nodeOption['text'] == ''){
        nodeOption['textAttribute'] = '텍스트없음';
    }
    nodeOptions[key] = nodeOption;
    treeOptions[key] = treeOption;

    //********************************************* set button *******************************************************//

    //******************************************** create tree dom ***************************************************//
    const treeContainer = document.createElement('ul');
    treeContainer.classList.add('tree');
    switch(treeOption['direction']){
        case 'horizontal':
            treeContainer.style.display='grid';
            // container 길이 계산해서 repeat 와 pixel 값 설정
            treeContainer.style.gridTemplateColumns = 'repeat(9, max-content)';
            treeContainer.style.gridTemplateRows = '';
            // treeContainer.style.flexDirection='row';
            break;
        default:
            treeContainer.style.display='flex';
            treeContainer.style.flexDirection='column';
    }

    if (Object.keys(nodeOption).indexOf('nodeLength') == -1){
        nodeOptions[key]['nodeLength'] = container.offsetWidth;
    }

    let nodeIndex = 0;

    // level, parent 단위 data structure 재확인
    // grouping by level and order

    if(sort){
        data.sort(function(a,b){
            let aLev = parseInt(a.level);
            let bLev = parseInt(b.level);
            if (aLev < bLev){
                return -1;
            }else if(aLev == bLev){
                if (parseInt(a.order) > parseInt(b.order)){
                    return 1;
                }else{
                    return -1;
                }
            }else{
                return 1;
            }
        });
    }

    // createNode
    const treeDataContainer = {};
    treeDataset[container.id] = {};
    for (const instance of data){
        let node = createLeaf(instance[nodeOption['textAttribute']], key);
        const span = node.querySelector('span');
        span.style.textIndent = (instance.level * 10).toString() + 'px';

        const attributes = {
            'nodeIndex':nodeIndex,
            'level':instance.level,
            'order':instance.order,
            'id':instance.id,
            'root_id':instance.root_id
        }
        if (Object.keys(nodeOption).indexOf('field_list') != -1){
            for (const field of nodeOption['field_list']){
                if (Object.keys(instance).indexOf(field)){
                    attributes[field] = instance[field]
                }
            }
        }

        _addNodeClasses(node, key);
        treeDataContainer[instance.id] = node;

        _eventOnClickNode(node, key);
        if (instance.level != 0){
            let parent = treeDataContainer[instance.parent_id];
            addChild(parent.querySelector('section'), node);
            node.dataset['parentIndex'] = parent.dataset['nodeIndex'];
        }else{
            treeContainer.appendChild(node);
        }
        setDefaultAttribute(node, attributes);
        nodeIndex++;
    }
    if(is_node_editable){
        const buttonContainer = document.createElement('article');
        buttonContainer.classList.add('buttonToolbar');
        const createButton = document.createElement('button');
        const deleteButton = document.createElement('button');
        createButton.textContent = '추가';
        deleteButton.textContent = '삭제';
        for (const classStr of ['button','middle-long']){
            createButton.classList.add(classStr);
            deleteButton.classList.add(classStr);
        }
        createButton.classList.add('save');
        deleteButton.classList.add('delete');
        deleteButton.disabled = true;
        buttonContainer.appendChild(createButton);
        buttonContainer.appendChild(deleteButton);

        createButton.onclick = (event)=>_eventOnClickCreateButton(event, key);
        deleteButton.onclick = (event)=>deleteNode(event, key);
        container.appendChild(buttonContainer);
    }
    container.appendChild(treeContainer);

    for (const node of container.querySelectorAll('li')){
        saveDefaultTreeData(node, datasetAttributes);
    }
    if (leafNodeType =='a'){
        Array.from(document.querySelectorAll('li[data-level="2"]')).forEach(li=>{
        li.dataset.url
        const span = li.firstElementChild.firstElementChild;
        const a = document.createElement('a');
        a.href = li.dataset.url;
        a.appendChild(span);
        li.firstElementChild.append(a);
    });
    }

    return treeDataset[container.id];
}

function getTreeData(key){
    return treeDataset[key];
}

function setNodeDataset(data, key, nodeIndex){
    treeDataset[key][nodeIndex] = data;
}

function getTreeDataKeys(node){
    return [node.closest('.tree-container').id, node.dataset['nodeIndex']];
}

function addChild(container, node){
    // root, container node, leaf

    if (container.nodeName == 'UL'){
        container.appendChild(node);
        saveDefaultTreeData(node, treeDataset[container.closest('.tree-container').id]['datasetAttributes']);
    }else{
        let childContainer = container.querySelector('ul');
        if (childContainer == undefined){
            childContainer = document.createElement('ul');
            childContainer.setAttribute('aria-haspopup', 'true');
            childContainer.setAttribute('aria-expanded', 'false');
            container.appendChild(childContainer);
            childContainer.classList.add('dropdown-section');
        }
        node.dataset['parentIndex'] = container.closest('li').dataset['nodeIndex'];
        childContainer.appendChild(node);
    }
}

function createLeaf(text, key){
    const li = document.createElement('li');
    const section = document.createElement('section');
    section.classList.add('node-list-container');
    const span = document.createElement('span');
    span.classList.add('node');
    span.textContent = text;

    section.appendChild(span);
    li.appendChild(section);
    li.style.width = nodeOptions[key]['nodeLength'];
    return li;
}

function setDefaultAttribute(node, attributes={}){
    for (const [key, value] of Object.entries(attributes)){
        node.dataset[key] = value;
    }
}

function _addNodeClasses(node, key){
    const nodeContainer = node.firstElementChild;

    const span = nodeContainer.querySelector('span');

    nodeContainer.classList.add('node-list-container');
    ['dropdown-toggler'].forEach(string =>{
        span.classList.add(string);
    });

    if (Object.keys(nodeOptions).indexOf(key) != -1 &&Object.keys(nodeOptions[key]).indexOf('classList') != -1){
        Array.from(nodeOptions[key]['classList']).forEach(classStr =>span.classList.add(classStr));
    }
}

function _eventOnClickCreateButton(event,key){
    event.stopImmediatePropagation();
    const [container, child] = createNode(event, key);
    addChild(container, child);
    [_eventOnNodeMouseOver, saveDefaultTreeData].forEach(func => {func(child)});
    _addNodeClasses(child, key);
    _eventOnClickNode(child, key);

    if (Object.keys(nodeOptions).indexOf('callbacks') != -1 && Object.keys(nodeOptions['callbacks']).indexOf('create') != -1){
        nodeOptions['callbacks']['create'](child);

        const parent = container.querySelector('ul');
        // click event not working
        parent.classList.add('open');
        child.dispatchEvent(new Event('click'));
    }else{
        child.dispatchEvent(new Event('click'));
    }
}

function saveDefaultTreeData(node, dataSetAttributes){
    // dataset to object
    const data = Object.assign({},  node.dataset);
    const [key, index] = getTreeDataKeys(node);
    setNodeDataset(data, key, index);
}

function _eventOnClickNode(node, key){
    const leafLevel = '2';
    node.addEventListener('click', function(event){
        event.stopImmediatePropagation();
        if (node.dataset.level != leafLevel){
            _eventOnNodeDropdownToggle(event, event.target.closest('ul'), true);
        }
        if (nodeOptions[key]['callbacks']['click'] != undefined){
            nodeOptions[key]['callbacks']['click'](event);
        }
    });
}

function getMaxRowIndex(container){
    const nodeIndexes = new Array();
    if (container.querySelectorAll('li').length ==0){
        return 0;
    }
    for (const node of container.querySelectorAll('li')){
        nodeIndexes.push(parseInt(node.dataset['nodeIndex']));
    }
    nodeIndexes.sort(function(a,b){
        if(a > b){
            return -1;
        }else if(a == b){
            return 0;
        }else{
            return 1;
        }
    });
    return nodeIndexes[0];
}

function createNode(event, key){
    /**
     * @params event : MouseEvent
     * @desc create leaf node and set default tree attribute to dataset
     * */
    // 1. create leaf
    // 2. set default dataset : level, order, parentIndex, dataIndex, parentId

    const leaf = createLeaf('leaf', key);
    const tree = event.target.closest('.tree-container');
    const selected = tree.querySelectorAll('.selected');
    let parent = selected[selected.length-1];
    const attributes = {
        level :0,
        order :0
    };

    attributes['nodeIndex'] = getMaxRowIndex(tree) +1;

    if (parent == undefined){
        parent = tree.querySelector('ul');
        attributes['order'] = tree.querySelector('ul').childElementCount +1;
    }else{
        const parentContainer = parent.closest('li');
        const parentDataset = parentContainer.dataset;
        attributes['parentId'] = parentDataset.id;
        attributes['root_id'] = parentDataset.root_id;
        attributes['parentIndex'] = parentDataset.nodeIndex;
        parent = parentContainer.querySelector('section');
        attributes['level'] = (parseInt(parentDataset.level) +1).toString();
        if(parent.querySelector('ul') != undefined){
            attributes['order'] = parent.querySelector('ul').children.length +1;
        } else{
            attributes['order'] = 1;
        }
    }

    setDefaultAttribute(leaf, attributes);
    // insert to parent
    return [parent, leaf];
}

function deleteNode(event, key){
    const target = document.querySelector('.selected').closest('li');
    if (target.dataset.id == ''){
        target.remove();
    }
    if(Object.keys(nodeOptions[key]['callbacks']).indexOf('delete') != -1){
        nodeOptions[key]['callbacks']['delete'](event);
    }
}

function _eventOnNodeMouseOver(node){
    node.addEventListener('mouseover', function(event){
        event.target.style.cursor='pointer';
    });
}

function _eventOnNodeDropdownToggle(event, container, closeOther=false, callback=undefined){
    /**
     * @param {HtmlDomElement} container : nodeDropDownEvent share area
     * @param {boolean} closeOther : close other expanded doms
     * @param {function} callback
     * @desc click 에 대한 nodeDropdown toggle event. 선택 된 경우 하위 내역은 전부 닫는다.
     * 이후 동일 선상에서의 expanded 유지 여부는 closeOther 로 결정
     *
     * */

    const target = event.target.nextElementSibling;
    let ariaExpanded = target.getAttribute('aria-expanded');
    ariaExpanded = ariaExpanded =='true' ? 'false' : 'true';

    if (closeOther){
        // 동 레벨 안에서 열린 다른 menu 를 전부 닫는다. 메뉴 안에 열린 중메뉴 소메뉴 도 전부 닫는다.
        const parent = target.closest('ul');
        if(parent!=undefined){
            const siblings = parent.querySelectorAll('li [aria-expanded=true]');
            if (siblings.length > 0){
                for(const bro of siblings){
                    bro.setAttribute('aria-expanded', 'false');
                    let ul = bro.closest('li').querySelector('ul');
                    if (ul!= undefined){
                        ul.classList.toggle('open');
                        ul.classList.remove('selected');
                    }
                }
            }
        }
    }
    Array.from(event.target.closest('.tree-container').querySelectorAll('.selected')).filter(span=> {span.classList.remove('selected'); return false});
    target.classList.add('selected');
    target.setAttribute('aria-expanded', ariaExpanded);
    const childNodeList = target.nextElementSibling;
    if (childNodeList){
        // childNodeList.style.display = ariaExpanded == 'true' ? 'block' : 'none';
        childNodeList.classList.toggle('open');
    }
    if(callback != undefined){
        callback(target);
    }
}

const setTreeForm = (url, nodeDataset, objectKey, dataKey, params, form,) =>{
    /**
     * @param {string} url
     * @param {object} nodeDataset
     * @param {string} objectKey
     * @param {string} dataKey
     * @param {object} params
     * @param {HTMLFormElement} form
     * @desc call http get method with url and params base on nodeDataset and save datat to nodeDataset[objectKey]
     * @requires nodeDataset['id']
     * */
    if (form.nodeIndex.value !=''){
        let selectedIndex = form.nodeIndex.value;
        const existNodeDataset = getTreeData(dataKey)[selectedIndex];
        if (Object.keys(existNodeDataset).indexOf(objectKey) == -1){
            existNodeDataset[objectKey] = {};
        }
        for(const el of form.elements){
            if(['','csrfmiddlewaretoken'].indexOf(el.name) != -1){
                continue;
            }
            if(el.type == 'checkbox'){
                existNodeDataset[objectKey][el.name] = el.checked;
                el.checked = false;
                continue;
            }
            existNodeDataset[objectKey][el.name] = el.value;
            if (el.name != undefined){
                el.value = '';
            }
        }
        setNodeDataset(existNodeDataset, dataKey, selectedIndex);
    }
    form.nodeIndex.value = nodeDataset['nodeIndex'];
    if(Object.keys(nodeDataset).indexOf('id') == -1 || nodeDataset[objectKey] != undefined){
        const instance = nodeDataset[objectKey];
        if (nodeDataset[objectKey] != undefined){
            for(const el of form.elements){
                if (el.name == undefined || Object.keys(instance).indexOf(el.name) == -1){continue;}
                if (el.type=='file'){continue;}
                if (el.type == 'checkbox'){
                    el.checked = nodeDataset[objectKey][el.name];
                    continue;
                }
                el.value = nodeDataset[objectKey][el.name];
            }
        }
    }
    else if(Object.keys(nodeDataset).indexOf(objectKey) == -1){
        fetchEvent(url, undefined, 'GET', params, (data)=>{
            if (data.data){
                form.nodeIndex.value = nodeDataset['nodeIndex'];
                if (data.data == undefined){
                    return;
                }
                const instance = data.data[0];
                for (const el of form.elements){
                    if (el.name == undefined || Object.keys(instance).indexOf(el.name) == -1){
                        continue;
                    }
                    if (el.type=='file'){
                        continue;
                    }
                    if (el.type == 'checkbox'){
                        el.checked = instance[el.name];
                        continue;
                    }
                    el.value = instance[el.name];
                }
                nodeDataset[objectKey] = data.data[0];
                setNodeDataset(nodeDataset, dataKey, nodeDataset['nodeIndex']);
            }else{
                nodeDataset[objectKey] = undefined;
            }
        })
    }
}

const setTreeRows = (url, nodeDataset, objectKey, dataKey, params, tbody, fieldList, hiddenFieldList=[], editable=false,
                     deleteUrl=undefined) =>{
    tbody.innerHTML = '';
    if (Object.keys(nodeDataset).indexOf('id') == -1){
        return;
    }else if(Object.keys(nodeDataset).indexOf(objectKey) == -1){
        nodeDataset[objectKey] = undefined;
        fetchEvent(url, undefined, 'GET', params, (data)=>{

            if (data.data){
                createRowWithObjectList(tbody,
                        data.data,
                        fieldList,
                        hiddenFieldList,
                        editable,
                        url,
                        deleteUrl
                        );
                    nodeDataset[objectKey] = data.data;
                    setNodeDataset(nodeDataset, dataKey, data['nodeIndex']);
            }
        });
    }else{
        if (nodeDataset[objectKey] != undefined){
            createRowWithObjectList(tbody,
                        nodeDataset[objectKey],
                        fieldList,
                        hiddenFieldList,
                        editable,
                        url,
                        deleteUrl
                        );
                    nodeDataset[objectKey] = data.data;
                    setNodeDataset(nodeDataset, dataKey, data['nodeIndex']);
        }
    }
}


