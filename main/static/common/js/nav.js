window.addEventListener('load', function(){
    /**
     * @desc nav 디자인
     * 1. each node dropdown
     * 2. header and drop down body
     * 3. row drop down
     * */
    _eventOnTabTemplate(document.querySelector('header .tab-container'), 'hover');
    const menuHeader = document.querySelector('.table-dropdown-body');
    if (menuHeader != undefined){
        menuHeader.addEventListener('mouseover', (event)=>{
            event.currentTarget.querySelector('tbody').classList.remove('hidden');
        });
        menuHeader.addEventListener('mouseleave', (event)=>{
            event.currentTarget.querySelector('tbody').classList.add('hidden');
        });
        _eventOnPageDropdownTable(document.querySelector('.table-dropdown-body'));
    }
    const menuList = document.getElementsByName('menu_list')[0];
    createTree(
        JSON.parse(menuList.value),
        document.getElementById('nav-tree'),
        {
            direction:'vertical',
        }, {
            textAttribute:'title',
            nodeLength:'100%',
            callbacks:{
            },
            field_list:['url']
        },
        false,
        true,
        false,
        ['id','parentIndex', 'rootId', 'level', 'nodeIndex','order', 'url'],
        'a'
    );
});

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
