window.addEventListener('load', function(){
    for(const menuButton of document.querySelector('nav').querySelectorAll('.dropdown-toggler')){
        menuButton.onclick = (event)=> toggleDropDown(event.target);
    }
    const iconMenu=document.querySelector('.icon-menu')
    if (iconMenu != undefined){
        const iconMenuButton = iconMenu.closest('button');
        if (iconMenuButton != undefined){
            iconMenuButton.onclick = (event)=> toggleMobileMenu(event.target);
        }
    }
})

function toggleMobileMenu(target){
    const isHidden = target.style.display =='none';
    const nav = target.closest('nav');
    const menuList = nav.querySelector('.nav.flexible.menu-list');
    if (!isHidden){
        menuList.style.display = menuList.style.display == 'none' ? 'block' : 'none';
    }
}

function toggleDropDown(target){
    let ariaExpanded = target.getAttribute('aria-expanded');

    ariaExpanded = ariaExpanded =='true' ? 'false' : 'true';

    // 동 레빌의 타 메뉴를 전부 닫는다.
    for (const menuListButton of target.closest('ul').querySelectorAll('[aria-expanded=true]')){
        menuListButton.setAttribute('aria-expanded', 'false');
        let menuList = menuListButton.nextElementSibling;
        if (menuList != undefined){
            menuList.classList.toggle('open');
            menuList.style.display = 'none';
        }
    }

    target.setAttribute('aria-expanded', ariaExpanded);

    const targetMenuList = target.nextElementSibling;
    if (targetMenuList){
        targetMenuList.style.display = ariaExpanded == 'true' ? 'block' : 'none';
        targetMenuList.classList.toggle('open');
    }


}




function viewLoginInfo() {
    const token = $("input[name='csrfmiddlewaretoken']").val();
    let html = '';

    $.ajax({
        url: "/system/api/account/",
        type: 'GET',
        data: {
            csrfmiddlewaretoken : token
        },
        success: function (data) {
            data.forEach(function(v, i) {
                if(v.type == 'SUPERVISOR') {
                    let innerHtml = [];
                    innerHtml.push(`<div class="loginBox super">`);
                    } else {
                    innerHtml.push(`<div class="loginBox">`);
                    }
                    innerHtml.push(`    <div class="loginInfo">`);
                    innerHtml.push(`        <span class="title">계정명</span>`);
                    innerHtml.push(`        <span class="data">${v.username}</span>`);
                    innerHtml.push(`    </div>`);
                    innerHtml.push(`    <div class="loginInfo">`);
                    innerHtml.push(`        <span class="title">유형</span>`);
                    innerHtml.push(`        <span class="data">${v.type}</span>`);
                    innerHtml.push(`    </div>`);
                    innerHtml.push(`    <div class="loginInfo">`);
                    innerHtml.push(`        <span class="title">소속부서</span>`);
                    innerHtml.push(`        <span class="data">${v.team}</span>`);
                    innerHtml.push(`    </div>`);
                    innerHtml.push(`</div>`);
            })
            
            $(".loginInfoModal .loginWrap").empty();
            $(".loginInfoModal .loginWrap").append(innerHtml.join(''));

            $(".loginInfoModal").show();
        }
    });
}
