let form = '';
let fileBoxContainer = '';
function initFileBox(container,
                     initialDataList = [], contentContainer=undefined
                     ){
    // 파일 init 시 형식 무조건 file, file_name 으로 맞출것, 그리고 업로드 일시, 작성자 맞출것
    fileBoxContainer = container;
    fileBoxContainer.querySelector('.button.popup').onclick = (event)=> showModal('.modal-file-list');

    form = container.closest('form');
    if(form == undefined){
        form = document.createElement('form');
        form.classList.add('hidden');
        container.appendChild(form);
    }
    initFileListModal(fileBoxContainer, initialDataList, contentContainer);
}

function createFileInput(){

    let input = document.createElement('input');
    input.classList.add('hidden');
    const files = form.querySelectorAll('[type=file]');
    input.name = files.length > 0 ? 'file'+ files[files.length-1].name.substr(5) : 'file0';


    input.type='file'
    input.onchange = (event) =>{
        if(event.target.value != ''){
            createFileRow(event.target);
            form.appendChild(input);
        }
    }
    input.click();
}

function initFileListModal(container=document, dataList=undefined, contentContainer=undefined){
    if (dataList!=[]){
        setInitialDataList(container, dataList, contentContainer);
    }
}

function setInitialDataList(container, dataList, contentContainer=undefined){
    const tbody = container.querySelector('.modal.modal-file-list #file-list-table tbody');
    if (tbody != null){
        const innerHtmlList = new Array();
        Array.from(dataList).forEach((data)=>{
            let trStr =`<tr><td><input type="hidden" name="id" value="${data['id']}"><a download href="${data['address']}">${data.file.replace(/^.*[\\\/]/, '')}</a></td><td class="text-center"><input type="hidden" name="status" value="r">기존</td><td class="text-center"><span class="button delete">삭제</span></td></tr>`;
            innerHtmlList.push(trStr);
        });
        tbody.innerHTML = innerHtmlList.join('');
        for(const td of tbody.querySelectorAll('.button.delete')){
            td.onclick = (event) => changeStatus(event);
        }
    }
    if (contentContainer != undefined){
        drawingFileContent(contentContainer, dataList);
    }
}
function drawingFileContent(contentContainer, dataList){
    const fileList = new Array();
    if (contentContainer.closest('table') != undefined){
        Array.from(dataList).forEach((data, index)=>{
            let extension = data.file.split('.');
            let fileName = data.file.replace(/^.*[\\\/]/, '');
            extension = extension[extension.length-1];
            if (['jpg','jpeg','png','gif'].indexOf(extension) != -1){
            fileList.push(
                `<tr><th>사진 ${index} <button id="table-delete" class="button delete" onclick="deleteImage(${ data.id })">삭제</button></th>
                <td colspan="3" style="text-align:center;">
                <a download href="/media/${ data.file }">
                                        <img style="height:200px;width:300px;" src="/media/${ data.file }">
                                    </a></td></tr>`);
            }else{
                fileList.push(
                `<tr><th>파일 ${index}<button id="table-delete" class="button delete" onclick="deleteImage(${ data.id })">삭제</button></th>
                <td colspan="3" style="text-align:center;">
                <a download href="/media/${ data.file }">${fileName}</a></td></tr>`);
            }
        });
    }
    contentContainer.innerHTML = fileList.join('');

}

function returnForm(container){
    // file
    const deleteFileList = new Array();
    for(let input of container.querySelectorAll('.modal-file-list tbody tr [name=status]')){
        if (input.value == 'd'){
            deleteFileList.push(input.closest("tr").querySelector('[name=id]').value);
        }
    }
    return {'deleteFileList':JSON.stringify(deleteFileList), 'newFileForm':form}
}

function openImage(event){

    let button = event.target;
    let tr = button.closest('tr');
    let file =  tr.querySelector('[type=file]');
    let src = '';

    if(file.files[0] != undefined){
        src = URL.createObjectURL(file.files[0]);
    }else{
        // db 에 저장된 text는 downloadable
        src = tr.querySelector('a').href;
    }
    let img = new Image();
    img.onload = (event)=>{
        // onload 에서 attribute 가 초기화 된 상태, script 에서 실행시 onload src 설정에 대한 attribute initial value 없음
        openImgPopup(img);
    }
    img.src = src;
}

function changeStatus(event){
    let button = event.target;
    let status = button.closest('tr').querySelector('[name=status]');
    if(status.value == 'r'){
        status.value ='d';
        button.textContent = '삭제 취소';
    }else{
        status.value ='r';
        button.textContent = '삭제';
    }
}

function addEventOnTableButton(){
    Array.from(document.querySelectorAll('.modal .tdBtn.delete')).forEach((button)=>{
        button.onclick = (event) => changeStatus(event);
    });

    Array.from(document.querySelectorAll('.modal .tdBtn.detail')).forEach((button)=>{
        button.onclick = (event) => openImage(event);
    });
}

function createFileRow(input){
    const fileListTableBody = fileBoxContainer.querySelector('.modal-file-list #file-list-table tbody');
    const tr = document.createElement('tr');
    tr.setAttribute('data-target', input.name)
    const fileName = input.value.replace(/^.*[\\\/]/, '');
    tr.innerHTML = `<td>${fileName}</td><td class="text-center"><input type="hidden" name="status" value="c">신규</td><td class="text-center"><span class="button delete">삭제</span></td>`;
    tr.querySelector('.button.delete').onclick = (event)=> removeRow(event);
    fileListTableBody.appendChild(tr);
}

function removeRow(event){
    const tr = event.target.closest('tr');
    form.querySelector(`input[name=${tr.getAttribute('data-target')}]`).remove();
    event.target.closest('tr').remove();

}

