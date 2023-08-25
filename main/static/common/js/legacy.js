// 안쓰는 함수
function addEventCreateRowData(selector_object_list){

    if(selector_object_list == undefined){
        for(let button of document.querySelectorAll('table .input-row button')){
            let model_name = button.closest('table').parentNode.querySelector('[name=model_name]');
            button.addEventListener('click', function(event){
                createRowData(this, model_name);
            });
        }
    }else{
        for(let object of selector_object_list){
            document.querySelector(object.selector).addEventListener('click', function(event){
                event.stopImmediatePropagation();
                createRowData(this, object.model, object.data_selector_dict, object.redirect_url);
            })
        }
    }
}

function createRowData(button_node, model, additional_data, redirect_url){
    /*
    * abbr: 독립적으로 입력 수정 가능한 데이터 전송
    * author: 임성혁(samson siba)
    * param: button_node:HtmlButtonElement, data_selector_dict:Object{field_name:value}, redirect_url:String
    * desc:
    * 현재는 table의 데이터 입력 기준으로 단독으로 처리 가능한 화면의 경우 한곳에서 입력, 수정 처리
    * 활용 조건
    * 1. table row id checkbox name = 'rowIdCheckbox'
    * 2. input[name=model_name] 을 table의 parent가 가지고 있을 것
    * 3. base_crud_script를 load 할것
    * */

    if (model == undefined){
        alert('저장 데이터베이스가 명시되지 않았습니다.');
        return
    }
    let tr = button_node.closest('tr');
    let formData = new FormData();

    if(tr != null){
        for(let input of tr.querySelectorAll('input, select, checkbox')){
            if (input.type=='button'){continue;}
            if(input.type=='file' && input.value !=''){
                formData.append(input.name, input.files[0], input.value.replace(/^.*[\\\/]/, ''));
                continue;
            }
            formData.append(input.name, input.value);
        }
    }

    formData.append('model', model);
    formData.append("csrfmiddlewaretoken",document.querySelector('[name=csrfmiddlewaretoken]').value);
    for(let key in additional_data){
        formData.append(key, additional_data[key]);
    }

    $.ajax({
        url: "/create_or_update/",
        type:'POST',
        // enctype: 'application/json',
        enctype: "multipart/form-data",
        data: formData,
        processData: false,
        contentType: false,
        success:function(data){
            if(data.result == 'success'){
                alert(data.message);
                if(redirect_url == undefined){
                    location.reload();
                }else{
                    location.href=redirect_url;
                }
            }else if(data.result == 'fail'){
                alert('데이터 저장을 실패하였습니다. 관리자에게 문의바랍니다.');
            }
        }
    });
}

// clone node and insert
function insert_clone_node(target, parent, index, callback){
    /*
    * abbr: 복제 노드 삽입
    * author: 임성혁(samson siba)
    * param:
    * - target: 복사 대상 node
    * - parent: 담을 html node
    * - index: 삽입위치; 'after', 'before', 숫자
    * - callback(node_: 각 화면 특성에 맞는 처리 함수, 현재는 복사된 node를 받아서 처리한다.
    * desc:
    * 복사 대상 node가 additional 이라는 class 가 없다면 인식을 위해서라도 부착
    * 인식용 class 갯수를 이용해서 name을 잡는데 사용한다.
    * 노드 복사용 함수로 화면 특성에 맞는 처리는 callback을 이용합시다.
    * -
    * */
    if(! target.classList.contains('additional')){
       target.classList.add('additional');
    }
    let clone = target.cloneNode(true);
    let previous_node;
    switch (index){
        case 'after': previous_node = target.nextElementSibling; break;
        case 'before': previous_node = target; break;
        default:
            previous_node = parent.children(index);
    }

    parent.insertBefore(clone, previous_node);

    if( callback != undefined){
        callback(clone);
    }else{
        if(parent.querySelector('input') !=null){
            changeInputNameNumber(clone, document.querySelectorAll('.additional').length-1);
        }
    }
}



function setTableObserver(tableNode){
    // table 에 대한  전체적인 mutationObserver 작업중
    let observer = new MutationObserver(callback);
    function callback (mutations) {
        // do something here
        mutations.forEach((mutations)=>{
            console.log(mutations.type);
        });
    }
    let observerOptions ={
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
    }
    observer.observe(tableNode, observerOptions);
}

