let calendar;

function initOrUpdateCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    if (calendar) {
        calendar.render();
        return;
    }

    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'ru',
        initialView: 'dayGridMonth',
        firstDay: 1,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        dateClick: function (info) {
            calendar.changeView('timeGridDay', info.dateStr);
        },
        events: async function (fetchInfo, successCallback, failureCallback) {
            try {
                const response = await fetch('/api/tasks');
                if (!response.ok) throw new Error();
                const tasks = await response.json();

                const events = tasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    start: task.dueDate,
                    allDay: !task.dueDate.includes('T'),
                    backgroundColor: task.isCompleted ? '#28a745' : (task.priority === 2 ? '#dc3545' : '#007bff'),
                    borderColor: 'transparent'
                }));
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        }
    });

    calendar.render();
    setTimeout(() => { calendar.render(); }, 50);
}

// Выставляем функцию в глобальную видимость для вызова из site.js
window.initOrUpdateCalendar = initOrUpdateCalendar;
