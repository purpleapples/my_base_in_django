function openPopup(url, style='width=800,height=1000'){
    let popup = window.open(url, 'popup', style);
    return popup;
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