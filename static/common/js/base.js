
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
        console.log(data.data)
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


function _eventOnTabTemplate(tab_selector='.tab-container'){
    let tab_container = document.querySelector(tab_selector);
    if (tab_container !== null){
        let header = tab_container.querySelector('.header');

        Array.from(header.children).forEach((li, index)=>{
            _eventOnClickTabHeader(li, tab_container, index);
        });
    }

}

const _eventOnClickTabHeader = (li, tab_container, index) => {

    li.addEventListener('click', function(event){
        let contains = li.classList.contains('act');
        let sibling = li.parentElement.children;
        if (contains){
            return;
        }
        for(let li of sibling){
            li.classList.remove('act');
        }
        contains ? this.classList.remove('act') : this.classList.add('act');
        let body_container = tab_container.querySelector('.body');
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

function loginSystem() {
    sessionStorage.removeItem('timer');

    if(!sessionStorage.getItem("timer")) {
        $("#login_form").submit();
    }
}

function logoutSystem() {
    sessionStorage.removeItem('timer');
    location.href="/logout";
}

$(window).resize(function() {
    var nav_ht = $("nav").outerHeight();
    $("#modal > div").css({
        marginTop : nav_ht + 50
    });
});


function PatternInspection(obj){
    var pattern_eng = /[a-zA-Z]/g;	// 영어
    var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g; //한글
    var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/g; // 특수문자

    obj = obj.replace(pattern_kor,'');
    obj = obj.replace(pattern_eng,'');
    obj = obj.replace(pattern_spc,'');
    obj = obj.replace(/-/g,'');
    
    return obj

}



function pieChartCreate(ctx,pieLabels,pieData,unit){ //파이차트 만들기 ctx : 차트 만들 영역 pieLabels : 라벨들 pieData: data들 unit: 앞에 들어갈 기호 나누기
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: pieLabels,
            datasets: [{
                data: pieData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(75, 206, 86, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth:1,
            }],
        },
        options: {
            legend: {
                position: 'bottom',
            },
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        display:false,
                        beginAtZero:true,
                    }
                }]
            },
            plugins: {
                datalabels: {
                    color: '#111',
                    align: 'top',
                    anchor:'top',
                    font: {
                        lineHeight: 1.6
                    },
                    formatter: function(value, ctx) {
                        if(unit=="time"){
                            return  value + "분";
                        }
                        if(unit=="count"){
                            return  value + "건";
                        }
                        if(unit =="money"){
                            if(value==0){
                                return '';
                            }else{
                                return '₩'+value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            }
                        }
                        
                    }
                }
            }
        }
    });
    myPieChart.update();
}

function lineChartCreate(ctx,label,date,count,unit){
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: date,
            datasets: [{
                label: label,
                data: count,
                backgroundColor: 'rgb(255, 99, 132)',
                fill:false, // line의 아래쪽을 색칠할 것인가? 
                borderColor: 'rgb(255, 99, 132)',
            }],
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        min:0,
                        beginAtZero:true,
                        callback: function(value, index, values) {
                            if(unit =="money"){
                                return '₩'+value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            }else{
                                return value;
                            }
                        }
                    }
                }]
            },
            plugins: {
                datalabels: {
                    color: '#111',
                    align: 'right',
                    anchor:'top',
                     font: {
                        lineHeight: 1.6
                    },
                    formatter: function(value, ctx) {
                        if(unit =="count"){
                            if(value!=0){
                                return  value + "건";
                            }else{
                                return '';
                            } 
                        }
                        if(unit =="money"){
                            if(value==0){
                                return '';
                            }else{
                                return '₩'+value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            }
                        }
                        if(unit == "time"){
                            if(value!=0){
                                return  value + "분";
                            }else{
                                return '';
                            }
                        }
                        if(unit =="login"){
                            if(value!=0){
                                return  value + "회";
                            }else{
                                return '';
                            }
                        }
                    }
                }
            }
        }
    });
    myLineChart.update();
}


/* 3자리 단위마다 콤마 생성 */
function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* 콤마 제거 */
function removeComma(str) {
    n = parseInt(str.toString().replace(/,/g,""));
    return n;
}

/* 테이블 셀 자동 병합 */
function fn_autoHtmlTrRowspanClass(selector, tdIdxSep, idxInExYn, trChkYn, tdIdxChkSep) {

    var selectorStr = "." + selector;
    fn_autoHtmlTrRowspan(selectorStr, tdIdxSep, idxInExYn, trChkYn, tdIdxChkSep);
}

function fn_autoHtmlTrRowspanId(selector, tdIdxSep, idxInExYn, trChkYn, tdIdxChkSep) {

    var selectorStr = "#" + selector;
    fn_autoHtmlTrRowspan(selectorStr, tdIdxSep, idxInExYn, trChkYn, tdIdxChkSep);
}


function fn_autoHtmlTrRowspan(selector, tdIdxSep, idxInExYn, trChkYn, tdIdxChkSep) {

    var trObj;							// TBODY TR object
    var trIdx;							// TR index
    var tdObj;							// TBODY TD object
    var tdIdx;							// TD index
    var tdTxt;							// TD text
    var nextRwTdObj;				// next row TD Object
    var nextRwTdTxt;				// next row TD text
    var rwspNum;						// RowSpan number
    var tempTdObj;					// set RowSpan target TD object				

    var chkBoolean = true;	// check use Flag
    var compChildTdObj;	    // compare TR children TD Object Array
    var compCurrTdObjTxt;		// compare TR children Current Row TD text(Array Index)
    var compNextTdObjTxt;		// compare TR children Next Row TD text(Array Index)
    var flagCnt = 0;				// Not RowSpan count

    var idxArr;
    var idxBoolean = true;			// default(true) : idxArr only rowspan, false : idxArr not rowspan

    var idxNonChkArr;						// choice compare TR children TD Array

    // parameter check
    if (tdIdxSep != undefined) {
        idxArr = tdIdxSep.split(",", -1);
    }

    // parameter check
    if (idxInExYn != undefined) {
        idxBoolean = eval(idxInExYn);
    }

    // parameter check
    if (trChkYn != undefined) {
        chkBoolean = eval(trChkYn);
    }

    // parameter check
    if (tdIdxChkSep != undefined) {
        idxNonChkArr = tdIdxChkSep.split(",", -1);
    }

    $(selector).find("tr").each(function (i) {

        trObj = $(this);
        trIdx = $(trObj).index();

        $(trObj).find("td").each(function (j) {

            tdObj = $(this);
            tdIdx = $(tdObj).index();
            tdTxt = $.trim($(tdObj).text());
            nextRwTdObj = $(trObj).next().find("td:eq(" + tdIdx + ")");
            nextRwTdTxt = $.trim($(nextRwTdObj).text());

            if ($(tdObj).css("visibility") == "hidden") {

                // current prevAll only visibility TD Array
                tempTdObj = $(trObj).prevAll("tr").find("td:eq(" + tdIdx + ")").filter(":visible");
                tempTdObj = $(tempTdObj)[$(tempTdObj).size() - 1];	// array last is closest				
                rwspNum = $(tempTdObj).prop("rowspan") + 1;

                /* rowspan and display:none */
                $(tempTdObj).prop("rowspan", rwspNum);
                $(tdObj).hide();
            }

            flagCnt = 0;	// initialization           

            if (chkBoolean && tdIdx != 0) {
                compChildTdObj = new Array();

                var tempIdx;
                var ifStr = "";
                var idxStr = "";

                // tr in td All or td choice
                if (idxNonChkArr != undefined) {
                    // make tr in td array for check
                    $.each(idxNonChkArr, function (x) {     // choice td     	
                        tempIdx = Number(idxNonChkArr[x]);
                        compChildTdObj[x] = $(trObj).find("td:eq(" + tempIdx + ")");
                        //console.log($(compChildTdObj[x]).prop("outerHTML"));          
                    });

                    ifStr = "tempIdx < tdIdx";
                    idxStr = "tempIdx";
                } else {
                    // make tr in td array for check
                    compChildTdObj = $(trObj).children("td");  // all td         

                    ifStr = "m < tdIdx";
                    idxStr = "m";
                }

                // this TR children TD check(low index TD RowSpan possible) : 앞쪽 td의 rowspan을 초과 못함
                $.each(compChildTdObj, function (m) {

                    tempIdx = $(compChildTdObj[m]).index();

                    if (eval(ifStr)) {

                        compCurrTdObjTxt = $(trObj).find("td:eq(" + eval(idxStr) + ")").text();
                        compNextTdObjTxt = $(trObj).next().find("td:eq(" + eval(idxStr) + ")").text();

                        // not RowSpan
                        if (compCurrTdObjTxt != compNextTdObjTxt) {
                            flagCnt++;
                        }
                    }
                });	// TD check each end  
            }

            if (tdTxt == nextRwTdTxt && flagCnt == 0) {
                $(nextRwTdObj).css("visibility", "hidden");	// not equal display:none
            }

            if (idxArr != undefined) {
                if (idxBoolean) {
                    // idxArr only rowspan
                    if (idxArr.indexOf(tdIdx.toString()) == -1) {
                        $(nextRwTdObj).css("visibility", "");	// remove style visibility, not RowSpan
                    }
                } else {
                    // idxArr not rowspan
                    if (idxArr.indexOf(tdIdx.toString()) > -1) {
                        $(nextRwTdObj).css("visibility", "");	// remove style visibility, not RowSpan
                    }
                }
            }
        });	// TD each end
    });	// TR each end
}

// 셀렉터 검색 기능
function ApplyChoices(select_box, obj) {
    for(let i=0; i<select_box.length; i++) {
        const element = document.querySelector(`.js-choice-${select_box[i]}`);
        const choices = new Choices(element, {
            searchResultLimit : 1000,
            searchFields : ['label','value','customProperties'],
            shouldSort : false,
            callbackOnCreateTemplates: function(template) {
                return {
                    item: (classNames, data) => {
                        return template(`
                            <div class="${classNames.item} ${
                            data.highlighted
                                ? classNames.highlightedState
                                : classNames.itemSelectable
                            } ${
                            data.placeholder ? classNames.placeholder : ''
                            }" data-item data-id="${data.id}" data-value="${data.value}" ${
                            data.active ? 'aria-selected="true"' : ''
                            } ${data.disabled ? 'aria-disabled="true"' : ''} data-obj='${obj}'>
                                ${data.label}
                            </div>
                        `);
                    }
                };
            }
        });

        const $dropdown_list = $(`select[name='${select_box[i]}']`).parent().next();

        $dropdown_list.find(".choices__input").keyup(function() {
            const inputValue = $(this).val().toUpperCase();

            $dropdown_list.find(".choices__item--choice").each(function() {
                const searchValue = $(this).text().toUpperCase();
                
                if(searchValue.indexOf(inputValue) < 0) {
                    $(this).remove();
                }
            });

            if ($.trim($dropdown_list.find(".choices__list").html()) === '') { 
                $dropdown_list.find(".choices__list").html("<div class='choices__item choices__item--choice has-no-results'>No results found</div>");
            }
        });
    }
}

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

// 선택항목 출력 - 모달
function rowPushOrPopModalShow() {
    $(".rowPushOrPopModal").fadeIn(200);
}

function rowPushOrPopModalClose() {
    $(".rowPushOrPopModal").fadeOut(200);
}

function removeSelectedRow(id) {
    $("#table tbody tr").each(function() {
        const tr_idx = $(this).data("id");
        if(id == tr_idx) {
            $(this).trigger("click");
        }
    });
}

function removeAllSelectedRow() {
    $(".selected_row tbody tr").each(function() {
        removeSelectedRow($(this).data("id"));
    });
}

function pascalToSnake(str){
    return str.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "");
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


function openPopupList(address, callback){
    /*
    * abbr: nav 바 삭제 후 table 선택 시 선택 값만 가지고 오게 하는 body 편집된 popup 열기
    * author: 임성혁(samson siba)
    * param: address:String(호출 urn)
    * desc:
    * 1. 팝업을 연다.
    * 2. nav 없애고 전체 선택, excel 버튼 제외한 모든 a, button 기능을 막는다.
    * 3. 전체 선택 통제 여부는 보류
    * 4. 테이블 line 을 선택하면 confirm 작동
    */
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
    width=2000, height=800`;
    let popup = window.open(address,"popup", params);
    let tr_list = [];
    // popup.document.querySelector('nav').remove();

    popup.addEventListener('load', function(event){
        event.stopPropagation();
        event.stopImmediatePropagation();

        const nav = event.target.querySelector('nav');

        if (nav != undefined){
            nav.remove();
        }
        for(let button of this.document.querySelectorAll('button, .button')){
            // 전체 선택 버튼 기능 잠시 대기 - 2022.04.14
            // if(button.textContent =='전체 선택'){
            //     button.removeEventListener('click', button.callee);
            //     button.onclick= (event) =>{
            //         if(this.confirm('현재 테이블의 내역을 모두 선택합니까?')){
            //             tr_list = popup.document.querySelectorAll('tbody tr:not(.filtered)');
            //             callback(tr_list);
            //             this.close();
            //         }
            //     }
            //     continue;
            // }
            button.disabled=true;
        }
        for(let a of this.document.querySelectorAll('a')){
            a.href='#';
        }
        for(let tr of this.document.querySelectorAll('tbody tr')){
            tr.onclick = (event) => {
                if(this.confirm('해당 데이터를 선택합니다.')){
                    tr_list.push(event.currentTarget);
                    callback(tr_list);
                    this.close();
                }
            }
        }
    });
    popup.dispatchEvent(new Event('load'));
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

//----------------------------------------------- ajax communication --------------------------------------------------

const fetchEvent = (url, token=undefined, method, body, success_func=undefined, fail_func=undefined, option=undefined) =>{
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
     *
     * success parameters
     * @param data{list>} - GET
     * @param message{string} - GET, POST, HEAD, OPTION, PUT, PATCH, DELETE
     * @param redirection_url{string} - optional
     *
     **/
    $('.load_bg').show();
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
        $('.load_bg').hide();
        if (response.status < 300){
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
            console.log(response)
            return response.json()
        }).then(responseData => {
            const a = document.createElement('a');
            a.download = responseData.file_name
            a.href = '/' + responseData.file_url;
            a.click();
            a.remove();
        })

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

function openPopup(url, style='width=800,height=1000'){
    let popup = window.open(url, 'popup', style);
    return popup;
}

function quickSort (array) {
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

const downloadDefault = (event, params) => {

    // a tag 에 media 를 통한 download 는 전부 막아버려야 한다. - mutation 을 통한 감시 필요
    fetchEvent('menu/attachment-file/api/download', undefined, 'POST',
        {path:'path'},
        (data)=>{

        });
}

const showTooltip = () => {
  const tooltip = document.querySelector('.tooltip-text');
  tooltip.style.visibility = 'visible';
  tooltip.style.opacity = '1';

  // Hide the tooltip after a delay
  setTimeout(function() {
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
  }, 2000); // Adjust the delay (in milliseconds) as needed
}
