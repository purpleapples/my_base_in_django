
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
