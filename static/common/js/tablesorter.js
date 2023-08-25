$(document).ready(function() {
    for (let table of document.querySelectorAll(".table")){
        if (table.id.indexOf('table') == -1 || table.id.indexOf('sticky') != -1){continue;}
        // th 에 정렬 기능 걸기
        $(table).tablesorter({
        theme : 'defalut',
        widthFixed : true,

        widgets: ["filter", "stickyHeaders", "zebra"] , //[ 'uitheme', 'zebra', 'stickyHeaders' ],

        widgetOptions: {
          // css class name applied to the sticky header row (tr)
          stickyHeaders : 'tablesorter-stickyHeader',

          // adding zebra striping, using content and default styles - the ui css removes the background from default
          // even and odd class names included for this demo to allow switching themes

          // use uitheme widget to apply defauly jquery ui (jui) class names
          // see the uitheme demo for more details on how to change the class names

        }
      });
      const sorterClassObject = {
                'tablesorter-headerAsc':'glyphicon glyphicon-arrow-up',
                'tablesorter-headerDesc':'glyphicon glyphicon-arrow-down',
                'tablesorter-headerUnSorted':'glyphicon glyphicon-sort'
      }
        Array.from(table.querySelector('thead').children.item(0).children).forEach((th)=>{
            th.addEventListener('click', function(event){
                let span = this.firstElementChild.firstElementChild;
                let sorterKeyClass = this.classList[1];

                $(span).attr('class', sorterClassObject[sorterKeyClass]);
            });
        });
    }

    //  $(".table").tablesorter({
    //     theme : 'defalut',
    //     widgets: [ 'filter', 'group', 'zebra' ],
    //     widgetOptions: {
    //       filter_reset         : '.reset',
    //       filter_childRows     : true,
    //       filter_childByColumn : true,
    //       filter_childWithSibs : false,
    //       group_collapsible    : true,
    //       group_collapsed      : false,
    //       group_count          : false
    //     }
    //  });

    for(let table of document.querySelectorAll('table.table')){
        if (table.id.indexOf('table') != -1){
            let td_list = table.querySelector('thead tr:nth-child(2)').querySelectorAll('input');
            if (td_list != null){
                for(let input of td_list){
                    input.classList.add('tablesorter-filter');
                    input.classList.add('form-control');
                }
            }
        }
    }
});
