
function initFileContainer(selector='.input-file-container',
                           inputName='file', isMultiple=false,
                           imageOnly=false,
                           cameraOnly=false,
                           showImage=false){
    const fileContainer = document.querySelector(selector);
    if (fileContainer == undefined){
        alert('파일 컨테이너가 존재하지 않습니다.');
        return;
    }
    const is_mobile = /android|iphone|ipod|ipad/.test(navigator.userAgent.toLowerCase());
    const inputFile = fileContainer.querySelector('input');
    const triggerButton = fileContainer.querySelector('.button.choose');
    const selectedFileDescriber = fileContainer.querySelector('.select-file-describer');
    // camera only when device is mobile
    if (is_mobile){
        inputFile.textContent = '촬영/파일 등록';
        if (cameraOnly){
            inputFile.capture = 'user';
        }
        // inputFile.addEventListener('beforeinput', function(event){
        //     if(event.target.value != ''){
        //         // 사진 파일 보관 필요
        //     }
        // })
    }
    if(imageOnly){
        inputFile.accept='image/*';

        // if (showImage){
        //     const img = document.createElement('img');
        //     img.classList.add('button');
        //     img.classList.add('icon-img');
        //     img.classList.add('tooltip-title');
        //     img.classList.add('hidden');
        //     // img.src='/main/static/img/icon/icon-img.png';
        //     img.onclick = (event) => showImagePopup(event.target, fileContainer);
        //     fileContainer.appendChild(img);
        // }
    }
    inputFile.multiple = isMultiple;

    triggerButton.onclick = (event) => {
        inputFile.click();
    }
    inputFile.name = inputName;

    inputFile.addEventListener('change', function(event){
        selectedFileDescriber.classList.remove('has-title');
        const file_name = event.target.value.split('\\');
        if (file_name.length == 0){
            selectedFileDescriber.textContent='선택 대상';
            return;
        }
        let file_name_list = new Array();
        for (const file of inputFile.files){
            file_name_list.push(file.name);
        }
        // title attribute not working in mobile
        if(is_mobile){
            // clickable tooltip
        }else{
            selectedFileDescriber.setAttribute('title', file_name_list.join('\n'));
            selectedFileDescriber.textContent = event.target.files.length.toString() + '개';
            selectedFileDescriber.classList.add('has-title');
        }
        // if (showImage && inputFile.files.length >0){
        //     img.classList.remove('hidden');
        // }else{
        //     img.classList.add('hidden');
        // }
    })
}

