
window.onload = function(){
    const Calendar = tui.Calendar;
    // tui calendar
    const templates = {
        milestone: function(schedule) {
            return getGridCategoryTemplate('milestone', schedule);
        },
        milestoneTitle: function() {
            return getGridTitleTemplate('milestone');
        },
        task: function(schedule) {
            return getGridCategoryTemplate('task', schedule);
        },
        taskTitle: function() {
            return getGridTitleTemplate('task');
        },
        allday: function(schedule) {
            return getTimeTemplate(schedule, true);
        },
        alldayTitle: function() {
            return getGridTitleTemplate('allday');
        },
        time: function(schedule) {
            return getTimeTemplate(schedule, false);
        },
        goingDuration: function(schedule) {
            return '<span class="calendar-icon ic-travel-time"></span>' + schedule.goingDuration + 'min.';
        },
        comingDuration: function(schedule) {
            return '<span class="calendar-icon ic-travel-time"></span>' + schedule.comingDuration + 'min.';
        },
        monthMoreTitleDate: function(date, dateStr) {
            let day = date.split('.')[2];
            return '<span class="tui-full-calendar-month-more-title-day">' + day + '</span> <span class="tui-full-calendar-month-more-title-day-label">' + dateStr + '</span>';
        },
        monthMoreClose: function() {
            return '<span class="tui-full-calendar-icon tui-full-calendar-ic-close"></span>';
        },
        monthGridHeader: function(dayModel) {
            let date = parseInt(dayModel.date.split('-')[2], 10);
            let classNames = ['tui-full-calendar-weekday-grid-date '];

            if (dayModel.isToday) {
                classNames.push('tui-full-calendar-weekday-grid-date-decorator');
            }

            return '<span class="' + classNames.join(' ') + '">' + date + '</span>';
        },
        monthGridHeaderExceed: function(hiddenSchedules) {
            return '<span class="weekday-grid-more-schedules">+' + hiddenSchedules + '</span>';
        },
        monthGridFooter: function() {
            return '';
        },
        monthGridFooterExceed: function(hiddenSchedules) {
            return '';
        },
        monthDayname: function(model) {
            return String(model.label).toLocaleUpperCase();
        },
        dayGridTitle: function(viewName) {
            /*
            * use another functions instead of 'dayGridTitle'
            * milestoneTitle: function() {...}
            * taskTitle: function() {...}
            * alldayTitle: function() {...}
            */

            return getGridTitleTemplate(viewName);
        },
        schedule: function(schedule) {
            /*
            * use another functions instead of 'schedule'
            * milestone: function() {...}
            * task: function() {...}
            * allday: function() {...}
            */

            return getGridCategoryTemplate(schedule.category, schedule);
        },

        // PopUp
        popupIsAllDay: function() {
            return 'All Day';
        },
        popupStateFree: function() {
            return 'Free';
        },
        popupStateBusy: function() {
            return 'Busy';
        },
        titlePlaceholder: function() {
            return 'Subject';
        },
        locationPlaceholder: function() {
            return 'Location';
        },
        startDatePlaceholder: function() {
            return 'Start date';
        },
        endDatePlaceholder: function() {
            return 'End date';
        },
        popupSave: function() {
            return 'Save';
        },
        popupUpdate: function() {
            return 'Update';
        },
        popupDetailDate: function(isAllDay, start, end) {
            let isSameDate = moment(start).isSame(end);
            let endFormat = (isSameDate ? '' : 'YYYY.MM.DD ') + 'hh:mm a';

            if (isAllDay) {
                return moment(start).format('YYYY.MM.DD') + (isSameDate ? '' : ' - ' + moment(end).format('YYYY.MM.DD'));
            }

            return (moment(start).format('YYYY.MM.DD hh:mm a') + ' - ' + moment(end).format(endFormat));
        },
        popupDetailLocation: function(schedule) {
            return 'Location : ' + schedule.location;
        },
        popupDetailUser: function(schedule) {
            return 'User : ' + (schedule.attendees || []).join(', ');
        },
        popupDetailState: function(schedule) {
            return 'State : ' + schedule.state || 'Busy';
        },
        popupDetailRepeat: function(schedule) {
            return 'Repeat : ' + schedule.recurrenceRule;
        },
        popupDetailBody: function(schedule) {
            return 'Body : ' + schedule.body;
        },
        popupEdit: function() {
            return 'Edit';
        },
        popupDelete: function() {
            return 'Delete';
        }
    };

    const options = {
        defaultView: 'month',
        timezone: {
        zones: [
            {
                timezoneName: 'Asia/Seoul',
                displayLabel: 'Seoul',
            },
        ],
        useCreationPopup:true,
        useFormPopup: true,
        useDetailPopup: true,
        },
        templates:templates

    };
    const container = document.getElementById('calendar');
    
    const calendar = new Calendar(container, options);
    calendar.on('ClickEvent', ({event})=>{
        el.innerText = 'xxxx'
    })

    calendar.setOptions({
      useFormPopup: true,
      useDetailPopup: true,
    });

    calendar.setOptions({
      template: {
        time(event) {
          const { start, end, title } = event;

          return `<span style="color: white;">${formatTime(start)}~${formatTime(end)} ${title}</span>`;
        },
        allday(event) {
          return `<span style="color: gray;">${event.title}</span>`;
        },
      },
    });
    // calendar.setOptions({
    //   useFormPopup: true,
    //   useDetailPopup: true,
    // });
    // Calendar.createSchedules()
}
function formatTime(time) {
      const hours = `${time.getHours()}`.padStart(2, '0');
      const minutes = `${time.getMinutes()}`.padStart(2, '0');

      return `${hours}:${minutes}`;
    }

const createEventObjectList = (dataList, attributeMap) =>{
    const eventObjectList = [];
    for (const object in dataList){
        let eventObject = {};
        for (const [key, value] of Object.entries(attributeMap)){
            eventObject[value] = object[key];
        }
        eventObjectList.push(eventObject);
    }
    return eventObjectList;
}


function getGridTitleTemplate(type) {
    let title = '';

    switch(type) {
        case 'milestone':
            title = '<span class="tui-full-calendar-left-content">MILESTONE</span>';
            break;
        case 'task':
            title = '<span class="tui-full-calendar-left-content">TASK</span>';
            break;
        case 'allday':
            title = '<span class="tui-full-calendar-left-content">ALL DAY</span>';
            break;
    }

    return title;
}

function getGridCategoryTemplate(category, schedule) {
    let tpl;

    switch(category) {
        case 'milestone':
            tpl = '<span class="calendar-font-icon ic-milestone-b"></span> <span style="background-color: ' + schedule.bgColor + '">' + schedule.title + '</span>';
            break;
        case 'task':
            tpl = '#' + schedule.title;
            break;
        case 'allday':
            tpl = getTimeTemplate(schedule, true);
            break;
    }

    return tpl;
}

function getTimeTemplate(schedule, isAllDay) {
    let html = [];

    if (!isAllDay) {
        html.push('<strong>' + moment(schedule.start.getTime()).format('HH:mm') + '</strong> ');
    }
    if (schedule.isPrivate) {
        html.push('<span class="calendar-font-icon ic-lock-b"></span>');
        html.push(' Private');
    } else {
        if (schedule.isReadOnly) {
            html.push('<span class="calendar-font-icon ic-readonly-b"></span>');
        } /*else if (schedule.recurrenceRule) {
            html.push('<span class="calendar-font-icon ic-repeat-b"></span>');
        } */ else if (schedule.attendees.length) {
            html.push('<span class="calendar-font-icon ic-user-b"></span>');
        } else if (schedule.location) {
            html.push('<span class="calendar-font-icon ic-location-b"></span>');
        } else {
            console.log(schedule)
            if(schedule.calendarId == 1) {
                // html.push('<span class="glyphicon glyphicon-book"></span>');
            } else if(schedule.calendarId == 2) {
                html.push('<span class="glyphicon glyphicon-bookmark"></span>');
        }
    }

    html.push(' ' + schedule.title);
}

return html.join('');
}

function getAllSchedule(calendarInstance) {
    const start_dt = moment(calendarInstance.getDate().getTime()).startOf('month').format("YYYY-MM-DD");
    const end_dt = moment(calendarInstance.getDate().getTime()).endOf('month').format("YYYY-MM-DD");
    const url = ''
    const params = {
        start_dt:start_dt,
        end_dt:end_dt
    }
    fetchEvent(url, undefined, 'GET', params, (data)=>{
        const calendarObj = [];
        for(let i=0; i<data.length; i++) {
                let calendarId;
                const state = data[i].state;
                const writer = data[i].writer;
                const writer_type = data[i].writer_type;

                calendarId = (state == 'important' ? 2 : 1);

                calendarObj.push({
                    id : data[i].id,
                    calendarId : calendarId,
                    title : data[i].title,
                    category : 'allday',
                    start : (data[i].start_dt).split("T")[0],
                    end : (data[i].end_dt).split("T")[0],
                    isAllDay : true,
                    bgColor : color[writer_type],
                    borderColor : color[writer_type],
                    dragBgColor : color[writer_type],
                    recurrenceRule : writer,
                    state : state,
                    body : data[i].is_repeat,
                    raw : data[i].repeat_cycle
                });
            }

            calendarInstance.clear();
            calendarInstance.createSchedules(calendarObj)
            calendarInstance.render();
    })

}