// table 전용 js 모음
// table에 등록 기능이 있을 경우 수정으로 모드 변경

function changeToEditMode(button_node, url='.'){

    let tr = button_node.closest('tr');
    let clone_node = tr.closest('table').querySelector('.input-row tr').cloneNode(true);
    let clone_td_list = clone_node.querySelectorAll('td');
    let insert_value = '';
    const terminateEditMode = (event, container_selector) =>{
        let tr = event.target.closest(container_selector);
        let tr_origin = document.getElementById('tr-origin-' + Array.from(tr.parentNode.children).indexOf(tr));
        tr.innerHTML = tr_origin.innerHTML;
    }


    let setElementValue = (el, insert_value) => {
        // pass file type
        // when checkbox or radio button then

        if(el.nodeName != 'SELECT'){
            if (el.type =='radio'){

            }else if(el.type == 'checkbox'){

            }else if(el.type !='file'){
                insert_value = typeof insert_value == 'string' ? insert_value.trim() : insert_value;
                el.value = insert_value;
            }
        }else{

            for(let option of el.options){
                if(option.textContent == insert_value){
                    el.value = option.value;
                    break;
                }
            }
        }
    }
    // 복제 후 저장
    let div = document.createElement('div');
    let tr_origin = document.createElement('tr');
    tr_origin.innerHTML = tr.innerHTML;
    // index 찾기
    tr_origin.id= 'tr-origin-' + Array.from(tr.parentNode.children).indexOf(tr);

    div.appendChild((tr_origin))
    div.classList.add('hidden');
    document.body.appendChild(div);


    for (const hidden of tr.querySelectorAll('input[type=hidden]')){
        clone_node.firstElementChild.appendChild(hidden.cloneNode(true));
    }

    const hiddenInputs = new Array();
    for(let i=0; i<clone_td_list.length; i++){
        let td = clone_td_list[i];
        let formElements = td.querySelectorAll('input, textarea, checkbox, select');
        for(let el of formElements){
            if (el.type == 'hidden'){
                hiddenInputs.push(el.cloneNode(true));
                continue;
            }
            insert_value = tr.children.item(i).textContent;
            setElementValue(el, insert_value);
        }
    }

    // 등록 옆에 취소 버튼 부착
    let button = document.createElement('span');
    button.classList.add('button');
    button.classList.add('function');
    button.textContent = '취소';


    button.onclick = (event) => terminateEditMode(event, 'tr')

    clone_node.lastElementChild.appendChild(button);
    clone_node.querySelector('.button.create').onclick = (event) => defaultPost(event, 'tr', url)
    tr.parentNode.insertBefore(clone_node, tr);
    tr.remove();
}

function setTableHeader(row_id_list, table_selector =undefined){

    if (table_selector == undefined){
        table_selector = '#table'
    }
    setTimeout(() => {
        let headerTr = document.querySelectorAll(`${table_selector} thead tr`);
        for(let id of row_id_list){
            headerTr[1].querySelector(`td[data-column='${id}']`).remove();
            headerTr[0].children.item(id).rowSpan=2;
        }
    },);
}


function selectRow(tr, only=false){

    let check = tr.classList.contains('is_chk');
    let tbody = tr.closest('tbody');
    if(only){
        for(let tr of tbody.children){
            tr.classList.remove('is_chk');
        }
    }
    check ? tr.classList.remove('is_chk') : tr.classList.add('is_chk');
}

function setTableWithList(datalist, table_id, isInit, callback=undefined){

    let table = document.getElementById(table_id);
    let tbody = table.querySelector('tbody');
    if (isInit){
        tbody.innerHTML = ''
    }
    let pkList =[]

    for(let data of datalist){
        let tr = document.createElement('tr');
        tr.addEventListener('click', function(event){
            selectRow(this, true);
        });
        let td= document.createElement('td');
        let pk = document.createElement('input');

        pk.type='checkbox';
        pk.value = data[0];
        pk.name='pk';
        pk.classList.add('hidden_chk');
        pkList.push(pk);
        td.textContent = data[1];
        td.insertBefore(pk, td.firstChild);
        tr.appendChild(td);
        for (let i=2; i<data.length; i++){
            let td = document.createElement('td');
            td.textContent = data[i];
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    if(callback != undefined){
        callback(table_id);
    }
    return table_id;
}

function changeTdToSelect(tr, td_index, name, option_list){

    let value = tr.children.item(td_index).textContent;
    tr.children.item(td_index).textContent = '';
    let select = document.createElement('select');
    select.classList.add('form-control');
    select.name=name;
    for(let option_text of option_list){
        let option = document.createElement('option');
        option.value= option_text;
        option.textContent = option_text;
        option.selected = option_text == value;
        select.appendChild(option)
    }
    tr.children.item(td_index).appendChild(select);
    return tr;
}

function checkAllRow(button, target_table_selector){
    let tbody = document.querySelector(target_table_selector+ ' tbody');

    if (button.textContent != '선택 취소'){
        Array.from(tbody.children).forEach((tr)=>{
            if (!tr.classList.contains('filtered')){
                tr.classList.add('is_chk');
            }
        });
        button.textContent = '선택 취소';
    }else{
        Array.from(tbody.children).forEach((tr)=>{
            if (!tr.classList.contains('filtered')){
                tr.classList.remove('is_chk');
            }
        });
        button.textContent = '전체 선택';
    }
}

function exportTableToExcelDefault(target_table, hiddenRowList, hiddenColumnList, document_name) {

    new Table2Excel(target_table, {
        widthRatio : .1,
        plugins: [
            Table2Excel.plugins.alignmentPlugin,
            Table2Excel.plugins.autoWidthPlugin,
            Table2Excel.plugins.fontPlugin,
            Table2Excel.plugins.fillPlugin,
            {
                workcellCreated({ workbook, tables, worksheet, table, workcell, cell, cellStyle, rowRange, colRange }) {
                    workcell.border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
                    };
                },worksheetCompleted({workbook, tables, worksheet, table}){
                    for(let row of hiddenRowList){
                        worksheet.spliceRows(row, 1)
                    }
                    let row_array = Array.from(table.querySelectorAll('tbody tr'));
                    let row_len = row_array.length;

                    while(row_len--) {
                        const row = row_array[row_len];

                        if($(row).hasClass("filtered")) {
                            const row_index = $(row).index() + 2;
                            worksheet.spliceRows(row_index, 1);
                        }
                    }
                    // 컬럼 길이 체크
                    // let columns = table.querySelector('thead tr:nth-child(1)').children;
                    // for(let i=0; i<worksheet.columns.length; i++){
                    //     console.log(worksheet.columns[i].width, columns[i].offsetWidth);
                    // }

                    for(let column of hiddenColumnList){
                        worksheet.columns[column].eachCell(function(cell, cellNumber){
                            cell.border = 0;
                            cell.fill = 0;
                            cell.value ='';
                        });
                    }

                    worksheet.eachRow(function(row, rowNumber) {
                        row.height = 26;
                    });

                }
            }
        ]
    }).export(document_name,'xlsx');
}

function addTableExportEvent(button_node, target_table, hiddenRowList, hiddenColumnList, document_name){
    // event 부착 간소하
    button_node.addEventListener('click', function(event){
        exportTableToExcelDefault(target_table, hiddenRowList, hiddenColumnList, document_name);
    });
}

function setTableSorter(table){
    const tr = table.querySelector('thead').lastElementChild;
    let tbody = table.querySelectorAll('tbody');
    tbody = tbody[tbody.length-1];

    Array.from(tr.children).forEach((th, index)=>{
       th.setAttribute('data-column-index', index);
       // number, text 로 구성
       // row index
       th.onclick = (event)=>{
           const index = event.target.getAttribute('data-column-index');
           if (th.hasAttribute('data-order')){
               let order = th.getAttribute('data-order');
               switch(order){
                   case 'ascending':
                       th.setAttribute('data-order','descending');
                       break;
                   case 'descending':
                       th.removeAttribute('data-order');
                       break;
               }
           }else{
               th.setAttribute(('data-order'), 'ascending');
           }
           const valueList = new Array();
           Array.from(tbody.children).forEach((tr, tdIndex)=>{
               let td = tr.children[index];
               valueList.push(td.textContent);
           });
           quickSort(valueList);
       }
    });
}

function setTableEventListerDefault(table){

    let table_selector = '#' + table.id;
    // table selector 적용
    let delete_button =document.getElementById(table.id +'-delete');
    if (delete_button != null){
        delete_button.addEventListener('click', function(event){
            deleteRowsModalShow(this);
        });
    }
    let tbody = table.querySelectorAll('tbody');
    tbody = tbody.length ==2 ? tbody[1] : tbody[0];
    Array.from(tbody.children).forEach((tr)=>{
        tr.addEventListener('click', function(event){
            selectRow(tr, false);
        });
        if (delete_button != null){
            tr.addEventListener('click', function(event){
                delete_button.disabled= tr.parentNode.querySelectorAll('.is_chk').length == 0;
            });
        }
    });
    // table delete button 적용
    let checkAllButton = document.getElementById( table.id+'-checkAll');
    if (checkAllButton != null){
        checkAllButton.addEventListener('click', function(event){
            checkAllRow(this, table_selector);
        });
    }
    setTableSorter(table);
    setTableFilter(table);
    setTableScroll(table);
}

function _eventOnFilterValueChange(event){
    const elIndex= new array();
    event.target.closest('tr').querySelectorAll('input, select').forEach(el=>{
        if (el.value != ''){
            elIndex[el.getAttribute('data-index')] = el.value;
        }
    });
    const tbodies = event.target.closest('table').querySelectorAll('tbody');
    const tbody = tbodies[tbodies.length-1];
    if (Object.keys(elIndex).length ==0){
        tbody.querySelectorAll('tr.filtered').forEach(tr=>{
           tr.classList.remove('filtered');
        });
    }else{
        Array.from(tbody.children).forEach(tr=>{
            let filter = false;
            for (const [index, value] in Object.keys(elIndex)){
                filter &= tr.children[index].textContent.indexOf(value) != -1;
            }
            if(filter){
                tr.classList.add('tr');
            }else{
                tr.classList.remove('tr');
            }
        });
    }
}
function createTableDataListFilter(url, attribute, condition={}){
    fetchEvent(url, undefined, 'GET', condition,(data)=>{
        const input = document.createElement('input');
        const datalist = document.createElement('datalist');
        input.type='list';
        datalist.id=attribute;
        const optionArray = new Array();
        const dataArray = new Array();
        for(const row of data.data){
            dataArray.push(row[attribute]);
        }
        const uniqueData = [...new Set(dataArray)];
        for (const uniqueValue of uniqueData){
            optionArray.push(`<option>${uniqueValue}</option>`);
        }
        datalist.innerHTML = optionArray.join('');
    });
}
// if one filter value changed using every filter value to filter tr
function setTableFilter(table, ignore_col_index=undefined, selectCols=undefined){

    const thead = table.querySelector('thead');
    const filterTarget = thead.lastElementChild;
    const filterTr = document.createElement('tr');
    Array.from(filterTarget.children).forEach((th, index)=>{
        if(ignore_col_index != undefined && ignore_col_index.indexOf(index) != -1){
            th.colspan=2;
        }else if(selectCols != undefined && selectCols.indexOf(index)!=-1){
            let th = document.createElement('th');
            let select = selectCols[index]();
            select.addEventListener('change', _eventOnFilterValueChange);
            select.setAttribute('data-index', index);
            th.appendChild(select);
        }
        else{
            let th = document.createElement('th');
            th.innerHTML = `<input type="search" data-index="${index}" onclick="_eventOnFilterValueChange(event)">`

            filterTr.appendChild(th);
        }
    });
}

function setTableListEventListerDefault(delete_func=undefined, export_func=undefined){

    Array.from(document.querySelectorAll('.table')).forEach((table)=>{
        if (table.id.indexOf('table') != -1){
            let table_selector = '#' + table.id;

            // table selector 적용
            let delete_button =document.getElementById(table.id +'-delete');
            if (delete_button != null){
                delete_button.addEventListener('click', function(event){
                    deleteRowsModalShow(this, table_selector);
                });
            }
            let tbody = table.querySelectorAll('tbody');
            tbody = tbody.length ==2 ? tbody[1] : tbody[0];
            Array.from(tbody.children).forEach((tr)=>{
                tr.addEventListener('click', function(event){
                    selectRow(tr, false);
                });
                if (delete_button != null){
                    tr.addEventListener('click', function(event){
                        delete_button.disabled= tr.parentNode.querySelectorAll('.is_chk').length == 0;
                    });
                }
            });
            // table delete button 적용
            let checkAllButton = document.getElementById( table.id+'-checkAll');
            if (checkAllButton != null){
                checkAllButton.addEventListener('click', function(event){
                    checkAllRow(this, table_selector);
                });
            }
            setTableSorter(table);
            setTableScroll(table);
        }
        // sticky table 생성 이 나중이므로 적용 불가
        // else if (table.id.indexOf('sticky') != -1){
        //     setTableSorter("#" +table.id);
        // }
    });
}

function movePage(a, page_number){
    const queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString)
    urlParams.set('page', page_number);
    a.href= '?' + urlParams;
    a.click();
}

function setTableScroll(table){
    if($(table).length > 0) {
        var table_offset = $(table).offset().top;
    }

    const scroll_type = $("[name='scroll_type']").val();

    if(scroll_type && scroll_type == 'row') {
        $(window).scroll(function() {
            if($(window).scrollTop() > table_offset) {
                var row_width = $(".listView .scroll__right").width();

                $(".col .buttonToolbar:first").addClass("fixed_top").css("width",row_width);
                $(".checked_list_button").css("opacity","0.9").css("right","30px");
            } else {
                $(".col .buttonToolbar:first").removeClass("fixed_top").css("width","100%");
                $(".checked_list_button").css("opacity","0").css("right","-10%");
            }
        });

    } else if(scroll_type && scroll_type == 'col') {
        $(window).scroll(function() {
            if($(window).scrollTop() > table_offset) {
                var row_width = $(".listView .col").width();

                $(".col .buttonToolbar:first").addClass("fixed_top").css("width",row_width);
                $(".tablesorter-sticky-wrapper .table").css("margin-top","60px");
            } else {
                $(".col .buttonToolbar:first").removeClass("fixed_top").css("width","100%");
            }
        });
    }

    $(window).scroll(function() {
        if($(window).scrollTop() > table_offset) {
            $(".scroll_box").css("opacity","0.9").css("right","30px");
        } else {
            $(".scroll_box").css("opacity","0").css("right","-10%");
        }
    });
}

function createRowWithObjectList(tbody, dataList, fieldList=undefined, hiddenField=undefined, editable=false, url='.',
                                 deleteUrl=undefined){

    tbody.innerHTML=''

    if (fieldList == undefined){
        fieldList = Object.keys(dataList[0])
    }

    const editButtonTd = document.createElement('td');
    editButtonTd.innerHTML = `<button class="button update" onClick="changeToEditMode(this, '${url}')">수정</button>`
    editButtonTd.classList.add('text-center');

    for (const data of dataList){
        let tr = document.createElement('tr');
        let innerHtml = new Array();
        for (const field of fieldList){
            let htmlStr = `<td>${data[field]}</td>`;
            if (data[field] == null){
                htmlStr = '<td></td>';
            }
            innerHtml.push(htmlStr);
        }
        if (hiddenField != undefined){
            innerHtml[0] = innerHtml[0].substr(4);
            const hiddenInputList = new Array();
            for (const field of hiddenField){
                hiddenInputList.push(`<input type="hidden" name="${field}" value="${data[field]}">` );
            }
            innerHtml[0] = '<td>' + hiddenInputList.join('') + innerHtml[0];
        }
        tr.innerHTML = innerHtml.join('');
        if(editable){
            tr.appendChild(editButtonTd.cloneNode(true));
        }
        if(deleteUrl != undefined){
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('button');
            deleteButton.classList.add('delete');
            deleteButton.textContent = '삭제';
            deleteButton.onclick = (event) =>{
                if(!confirm('해당 내역을 삭제하는데 동의합니다.')){
                    return;
                }
                fetchEvent(deleteUrl, undefined, 'DELETE', {pk_list:[tr.querySelector('[name=id]').value]},
                    (data)=>{
                        alert(data.message);
                        location.reload();
                    })
            }
            const td = document.createElement('td');
            td.classList.add('text-center');
            td.appendChild(deleteButton);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
}

function setStickyPosition(table, fixedColumnIndexes){
    const thead = table.querySelector('thead');
    thead.zIndex = 3;
    const tbody = table.querySelector('tbody');
    const coordinate = thead.children[0].children[fixedColumnIndexes[0]].getBoundingClientRect();
    const x = coordinate.x;
    const lastCoordinate = thead.children[0].children[fixedColumnIndexes[fixedColumnIndexes.length-1]+1].getBoundingClientRect();
    const lastX = lastCoordinate.x - x;
    const y = thead.lastElementChild.firstElementChild.getBoundingClientRect().height;

    // 다중 row 일 경우 sticky
    // last row 의 left 를 지정
    // last row 의 top 을 지정
    // tbody thead
    // thead
    Array.from(thead.children).forEach((tr, rowIndex)=>{
        tr.style.position='sticky';

        if (rowIndex == 0){
            tr.style.top = 0;
            tr.style.zIndex = 3;
            Array.from(tr.children).forEach((th, index)=>{
               if (fixedColumnIndexes.indexOf(index) !=-1){
                   th.style.left=th.getBoundingClientRect().x -x;
                   th.style.top=y - coordinate.y;
                   th.classList.add('sticky');
               }  else{
                   th.style.top=0;
               }
            });
        }else{
            tr.style.zIndex=1;
            tr.style.top=lastCoordinate.height;
            Array.from(tr.children).forEach(th=>{
                th.style.zIndex=1;
                th.style.left=lastX;
            });
        }
    });
    Array.from(tbody.children).forEach(tr=>{
        tr.style.zIndex=1
        for (const index of fixedColumnIndexes){
            let td = tr.children[index];
            td.style.position='sticky';
            td.style.background='white';
            td.style.left=td.getBoundingClientRect().x -x;
            td.style.zIndex=1;
        }
    });
}


//
// function addTableFilter(table){
//     // table 별 filter 설정
//     // data attribute 사용
//     // 사용 attribute : data-type, data-url, data-index, data-input
//     // data-type : 입력 제어 속성
//     // data-url : 데이터로 datalist를 가져오기 위한 속성
//     // data-index : 해당 column의 순서
//     // data-form-element : filter에 사용될 form element
//
//     let head = table.querySelector('.filter-header, thead');
//     let filter_target_tr = head.children.lastElementChild;
//     let tr = document.createElement('tr');
//     for (const th of filter_target_tr.children){
//         const data_type = th.getAttribute('data-type');
//         const data_url = th.getAttribute('data-url');
//         const data_index = th.getAttribute('data-index');
//         const data_input = th.getAttribute('data-input');
//
//         // data_url 이 있을 경우 input에 따라 움직인다. 함수는 당연히 재정렬 시킨다.
//         // boolean일 경우 checkbox를 변경한다.
//         if (data_url != ''){
//             fetchEvent(data_url, undefined, 'POST', (data)=>{
//
//             });
//         }
//         if (data_type == 'text'){
//
//         }
//     }
//     // tr 하나 더 생성 후 여기에 전부 담아 넣는다.
//
//
// }


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

// const createTreeDropdownTable =(container, data, headerClassList, cellClassList) =>{
//     // header -> data first
//     const table = document.createElement('table');
//     table.innerHTML = "<thead><tr></tr></thead><tbody></tbody>"
//     const theadTr = table.querySelector('thead tr');
//     const tbody = table.querySelector('tbody');
//     console.log(theadTr);
//     container.appendChild(table);
// }


const _eventOnPageDropdownTable = (table) => {
    const tBody = table.querySelector('tbody');
    const _eventOnMouseover = (event) =>{
        const category = document.querySelector(`[data-id='${event.currentTarget.dataset['parentId']}']`);
        category.style.background = 'blue'
        category.style.color = 'white';
    }
    const _eventOnMouseleave = (event) =>{
        const category = document.querySelector(`[data-id='${event.currentTarget.dataset['parentId']}']`);
        category.style.background = 'white'
        category.style.color = 'rgba(17,1,1,0.71)';
    }

    Array.from(tBody.querySelectorAll('td:not(.category)')).forEach(td=> {
        td.addEventListener('mouseover', _eventOnMouseover);
        td.addEventListener('mouseleave', _eventOnMouseleave);
    })
}
