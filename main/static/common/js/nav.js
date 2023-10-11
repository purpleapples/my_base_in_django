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

