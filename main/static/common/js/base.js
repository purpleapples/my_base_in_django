/**
 * - default setting in document.ready
 * : button bubbling prevent, datetimepicker setting, modal height setting, mobile setting
 *
 * - base function list
 *
 * set_screen_comment() : get screen.user_comment
 *
 *
 * */
let REMAIN_LOGIN_TIMER = moment("2021-11-04 03:00:00");
let getSessionTimer;

if(!sessionStorage.getItem('timer')) {
    sessionStorage.setItem('timer',REMAIN_LOGIN_TIMER.format("YYYY-MM-DD HH:mm:ss"));
    getSessionTimer = sessionStorage.getItem('timer');
} else {
    getSessionTimer = sessionStorage.getItem('timer');
}

// if all screen need screen comment
const set_screen_comment = ()=>{
    fetchEvent('/menu/screen/api/comment', undefined, 'GET', {}, (data)=>{

        if (data.data !== null){
            // 만들어서 setting 하자
            const screenComment = document.getElementById('screen-comment');
            if (screenComment !== null){
                screenComment.textContent = data.data;
            }
        }
    });
};

$(document).ready(function() {
    // set_screen_comment();

    // table 각 row 클릭 => table.js 로 이관
    // checkAll 전체 선택 => table.js 로 이관

    // 이벤트 버블링 막기
    $("button, .button").click(function(e) {
        e.stopPropagation();
    });

    $(document).on("click", ".choices, .etc", function(e) {
        $(this).closest("tr").trigger("click");
    });

    var nav_ht = $("nav").outerHeight();
    $("#modal > div").css({
        marginTop : nav_ht + 50
    });

    // 패드 화면 -> 안드로이드 환경
    var varUA = navigator.userAgent.toLowerCase(); //userAgent 값 얻기

    if(varUA.match('android') != null) {
        $("body").addClass('pad');
        $("body.pad").css("display","block");
    } else {
        $("body").css("display","block");
    }

    // Bootstrap Datetimepicker

    $(".datetimepicker").datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'ko',
        showClear: true,
        showTodayButton: true,
        showClose: true,
        // date : moment().format("YYYY-MM-DD")
    });

    $(".datetimepicker_update").datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'ko',
        showClear: true,
        showTodayButton: true,
        showClose: true
    });
    // 테이블 스크롤 상단 고정 함수화 하고 table 로 이관 필요
});


const loginSystem = () => {
    sessionStorage.removeItem('timer');

    if(!sessionStorage.getItem("timer")) {
        $("#login_form").submit();
    }
}

const logoutSystem = () => {
    sessionStorage.removeItem('timer');
    location.href="/logout";
}

$(window).resize(function() {
    var nav_ht = $("nav").outerHeight();
    $("#modal > div").css({
        marginTop : nav_ht + 50
    });
});


// POST -> json 형식으로 보낼 때 token 여부 체크
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// 페이지 최상단으로 이동
function moveScrollTop() {
    $('html,body').animate({
        scrollTop : 0
    }, 500);
}

function openImgPopup(img){
    // 설비 AS 요청 기능 : 이미지 선택 시 원래 크기의 팝업 창 나오는 기능
    let params = 'scrollbars=no,resizable=no,location=no,toolbar=no,menubar=no,width='+img.naturalWidth + ',height='+ img.naturalHeight;
    window.open(img.src,"popup", params);
}

function setImgClickEvent(){
    // 화면 상 모든 img 에 click 시 popup event 부착
    Array.from(document.querySelectorAll('img')).forEach((img)=>{img.onclick= (event)=> {
        openImgPopup(event.target);
    }});
}

function deleteNode(button_node, is_ancestor, target_selector, callback) {
    /*
    * abbr: 노드 삭제 및 화면별 특성에 맞는 처리
    * author: 임성혁(samson siba)
    * param:
    * - event: HTMLClickEvent:HTMLAnyElement?
    * - is_ancestor: 직속 조상여부
    * - target_selector: 삭제 대상
    * - callback : 화면 특성에 맞는 callback 함수
    * desc: node 삭제 후 화면별 특성은 callback 으로 처리
    *
    * */
    if(is_ancestor){
        button_node.closest(target_selector).remove();
    }else{
        document.querySelector(target_selector).remove();
    }
    if(callback != undefined){
        callback();
    }
}

//********************************************** ajax communication ***************************************************//

const fetchEvent = (url, token=undefined, method, body, success_func=undefined, load_modal=true, fail_func=undefined, option=undefined) =>{
    /**
     * 통신용 함수
     * response type에 따라 결과값에 대한 처리 지정
     * response type은 option에 따라 가변 : no-cors 는 opaque type response 반환 : 해당 type은 어떠한 결과값도 받을 수 없음
     * 단 file 내려받기의 경우는 해당 pure state 안에서는 구분이 불가능 함으로 해당 함수가 아닌 downloadTempFile에서 실새
     * @param url{string}
     * @param token {string|undefined}
     * @param method{string}
     * @param body{Object|FormData}
     * @param success_func{Function}

     * success parameters
     * @param data{list>} - GET
     * @param message{string} - GET, POST, HEAD, OPTION, PUT, PATCH, DELETE
     * @param redirection_url{string} - optional
     *
     **/
    if (load_modal){
        $('.load_bg').show();
    }
    let options = {};
    let defaultHeader = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    };
    // formData 와 object의 차이 해결 필요

    if (method != 'GET' && method != 'HEAD'){
        if (body instanceof FormData){
            // only a form element has a method attribute
            options = {method:method, body:body};
        }else{
            if (token != undefined || document.getElementsByName('csrfmiddlewaretoken')[0] != undefined){
                defaultHeader['X-CSRFToken'] = token != undefined ? token :document.getElementsByName('csrfmiddlewaretoken')[0].value;
            }
            options = {
                method : method,
                mode : 'cors',
                cache : 'no-cache',
                redirect : 'manual',
                credentials : 'include',
                headers : defaultHeader,
                body : JSON.stringify(body)
            };
            if (option != undefined){
                for(const [key, value] of Object.entries(option)){
                    options[key] = value;
                }
            }
        }
    }else{
        url = url +'?'+ new URLSearchParams(body);
        options = {
            method : method,
        }
    }

    fetch(url, options).then((response)=> {
        if (load_modal){
            $('.load_bg').hide();
        }

        if (response.status < 300  && response.status > 201){
            if(response.status==203){
            }
            if(response.status==204){
                // GET 204 ?
                if (success_func == undefined){
                    alert('조회된 데이터가 없습니다.');
                    return;
                }else{
                    // GET, HEAD
                    success_func({'message':'조회된 데이터가 없습니다.'});
                    return;
                }
            }
            if(response.status==205){
                // OPTIONS METHOD
            }
            return response.json();
        }

        if (response.status >= 400){
            if(fail_func != undefined) {
                alert(response.statusText);
                fail_func(response);
            }else{
                throw response.json();
            }
            return;
        }
        else if (response.status==0 && response.type == 'opaque' ){
            return response
        }
        else if(response.ok && [200,201].indexOf(response.status) !=-1){
            const jsonResponse = response.json()
            return jsonResponse;
        }else{
            if(fail_func != undefined){
                fail_func();
            }
        }
    }).then((responseData)=>{
            if (responseData == undefined || responseData == null){
            }else{
                if (success_func != undefined){

                    success_func(responseData);
                } else{
                    // location.reload();
                }
            }
        }
        ).catch(
            (error)=>{
                if (typeof error ===  'object' && typeof error.then === 'function'){
                    error.then((errorJson) => {
                        alert(errorJson.message);
                        location.reload();
                    })
                }else{
                    if(fail_func != undefined){
                        fail_func(error);
                    }else{
                        alert(error);
                        // alert("code : " + error.status + "\n" + "message : " + error.responseText + "\n" + "error : " + error);
                    }
                }
        });
}

const downloadTempFile = (url, params) => {
        url = url +'?'+ new URLSearchParams(params);
        const options = {
            method : 'GET',
        }

        fetch(url, options).then(response => {
            if( response.status ==204){
                alert('내려받을 파일이 없습니다.');
                return;
            }
            return response.json()
        }).then(responseData => {
            const a = document.createElement('a');
            a.download = responseData.file_name
            a.href = '/' + responseData.file_url;
            a.click();
            a.remove();
        });
}


function extractBackUpData(selector=undefined){
    // 선택된 테이블의 목록에 존재하는 데이터를 조회해서 해당 데이터를 구성하는 외부 키를 역참조실시하여 모든 데이터를 순서대로 정렬 시킨 후
    // load 가능한 json 형태로 만들어 저장한다.
    // 테이블 은 하나로 제한 한다.
    let pk_list = [];
    selector = selector == undefined ? '#table tr.is_chk [name=id]' : selector
    document.querySelectorAll(selector).forEach((pk)=>{pk_list.push(pk.value)});
    fetchEvent('/system/api/data/create/dump-file', undefined, 'POST', pk_list, (data)=>{alert(data.message);});
}

//*********************************************** sort algorithm *****************************************************//

function quickSort (array, dataType='int') {
  if (array.length < 2) {
    return array;
  }
  const pivot = [array[0]];
  const left = [];
  const right = [];

  for (let i = 1; i < array.length; i++) {
    if (array[i] < pivot) {
      left.push(array[i]);
    } else if (array[i] > pivot) {
      right.push(array[i]);
    } else {
      pivot.push(array[i]);
    }
  }
  return quickSort(left).concat(pivot, quickSort(right));
}


//******************************************* tooltip ****************************************************************//
const showTooltip = (coordinate = [-100,50]) => {
    /**
     * @abstract tooltip 표기 기능.
     * @param number[] coordinate : tooltip move coordinate
     * @description 버튼 클릭시 tooltip 을 보여준다. 위치는 버튼의 위치를 고려하여 작성자가 직접 계산 후 삽입한다.
     *
     * */
    const tooltip = document.querySelector('.tooltip-text');

    tooltip.style.left = coordinate[0];
    tooltip.style.top = coordinate[1];
    tooltip.style.opacity = tooltip.style.opacity == 0.7 ? 0 : 0.7;
}

const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const snakeToCamelCase = (str) => str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

//********************************************* tab ******************************************************************//
// only for dataset

const _eventOnTabTemplate = (container, eventType) =>{
    /**
     * @param {string} tab_selector : selector string for querySelector function
     *
     * */

    let header = container.querySelector('.header');


    Array.from(header.children).forEach((li, index)=>{
        if (eventType=='click'){
            _eventOnClickTabHeader(li, container, index);
        }else{
            _eventOnHoverTabHeader(li, container, index);
        }
    });
}

const _eventOnClickTabHeader = (li, container, index) => {
    li.addEventListener('mouseover', function(event){
        let contains = li.classList.contains('act');
        let sibling = li.parentElement.children;
        if (contains){
            return;
        }
        for(let li of sibling){
            li.classList.remove('act');
        }
        contains ? this.classList.remove('act') : this.classList.add('act');
        let body_container = container.querySelector('.body');
        for(let i=0; i< body_container.children.length; i++){
            let content = body_container.children.item(i);
            if (i==index){
                content.classList.contains('hidden') ? content.classList.remove('hidden') : content.classList.add('hidden');
                continue;
            }
            content.classList.add('hidden');
        }
    });

}
// tab hover

const _eventOnHoverTabHeader = (li, container, index, animateClassStr='show-left') => {
    /**
     * @desc each header content share one area
     * @param li {HTMLElement} : header
     * @param container {HTMLElement} : tab header and body container
     * @param index {int} : index of li in ul
     * */
    li.addEventListener('mouseover', function(event){
        let body_container = container.querySelector('.body');
        for (const child of body_container.children){
            child.classList.add('invisible');
            child.classList.remove(animateClassStr);
        }
        body_container.children.item(index).classList.remove('invisible')
        body_container.children.item(index).classList.add(animateClassStr);
    });

    container.addEventListener('mouseleave', function(evnet){
        let body_container = container.querySelector('.body');
        for (const child of body_container.children){
            child.classList.add('invisible');
            child.classList.remove(animateClassStr);
        }
    });

}
//*********************************************** mouse scroll dragging **********************************************//
function setScrollMouseDrag(containerElement){
    /**
     * @desc attach event on dragging scroll by mouse dragging
     * @param containerElement{HTMLElement} : dragging area
     * @author samson siba
     * */
    let pos = { top: 0, left: 0, x: 0, y: 0 };
    containerElement.scrollTop = 0;
    containerElement.scrollLeft = 0;

    const mouseMoveHandler = function (e) {
        // How far the mouse has been moved
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;

        // Scroll the element
        containerElement.scrollTop = pos.top - dy;
        containerElement.scrollLeft = pos.left - dx;

        // console.log(pos.x, pos.y, e.clientX , e.clientY,dx,dy, containerElement.scrollLeft, containerElement.scrollTop);
    };

    const mouseUpHandler = function (e) {
        containerElement.removeEventListener('mousemove', mouseMoveHandler);
        containerElement.removeEventListener('mouseup', mouseUpHandler);

        containerElement.style.cursor = '';
        containerElement.style.removeProperty('user-select');
    };

    const mouseDownHandler = function (e) {
        if (e.button == 0){ // left button
            containerElement.style.cursor = 'grabbing';
            containerElement.style.userSelect = 'none';
            pos = {
                // The current scroll
                left: containerElement.scrollLeft,
                top: containerElement.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            };
            containerElement.addEventListener('mousemove', mouseMoveHandler);
            containerElement.addEventListener('mouseup', mouseUpHandler);
        }

    };
    containerElement.addEventListener('mousedown', mouseDownHandler);
}

//****************************************************** mouse context menu ******************************************//
function createTableContextMenu(){
    let contextMenu = document.createElement('ul');
    let contextMenuChildren = new Array();
    contextMenuChildren.push( '<li onclick="copyText(event)">글자 복사</li><li><a onclick="history.back()">뒤로 가기</a>');
    // page 있을 경우 페이지 이동 기능 넣는다.
    const pageComponent = document.querySelector('.pagination');
    if (pageComponent != null){
        //  현재 페이지 보고 움직인다.
        const currentPage = pageComponent.querySelector('.current-target').textContent;
        let componentLength = pageComponent.children.length;
        if (componentLength > 3){
            const firstPage = pageComponent.children[1].textContent;
            const lastPage =  pageComponent.children[componentLength-2].textContent;
            if (currentPage != firstPage && currentPage != '1'){
                (parseInt(currentPage) - 1).toString();
                contextMenuChildren.push('<li><a onclick="movePage(this,' + (parseInt(currentPage) - 1).toString() + ')">페이지 뒤로 넘기기</a>');
            }
            if (currentPage != lastPage){
                contextMenuChildren.push('<li><a onclick="movePage(this,' + (parseInt(currentPage) + 1).toString() + ')" >페이지 앞으로 넘기기</a>');
            }

        }
        contextMenu.innerHTML = contextMenuChildren.join('') +'</ul>';
    }else{
        if (contextMenuChildren.length>0){
            contextMenu.innerHTML = contextMenuChildren.join('') +'</ul>';
        }
    }
    return contextMenu;
}

function createContextMenu(container, contextMenus, contextMenuSelector='#context-menu'){
    /**
     * @param {HtmlElement} container
     * @param {HtmlElement} menuList
     * @param {String} contextMenuSelector
     */
    container.addEventListener('contextmenu', function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        const contextMenu = document.querySelector(contextMenuSelector);
        const contextMenuBody = contextMenu.querySelector('.modal-content');
        contextMenuBody.innerHTML = '';
        contextMenuBody.appendChild(contextMenus);
        contextMenu.style.top = event.clientY+'px';
        contextMenu.style.left = event.clientX+'px';
        showModal(contextMenuSelector);
    });
    window.addEventListener('click', function(event){
        let display = document.querySelector(contextMenuSelector).style.display;
        document.querySelector(contextMenuSelector).style.display= display !='none' ? 'none' : display;
    })
}

//************************************** functional buttons **********************************************************//
function _eventOnVisibleToggler(visibleTogglerList){
    Array.from(visibleTogglerList).forEach(button=>{
        button.addEventListener('click', function(event){
            const button = event.target;
            document.querySelector(button.dataset.target).classList.toggle('hidden');
            button.textContent =  button.textContent == '숨김' ? '설정': '숨김';
            button.dataset.toggle = button.dataset.toggle == 'on' ? 'off' : 'on';
        });
    });
};
