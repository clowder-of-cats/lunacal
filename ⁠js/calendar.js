document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: 'data/events.json',
    editable: false,
    selectable: false
  });
  calendar.render();
});

function copyToClipboard() {
  const url = document.getElementById('feed-url').textContent;
  navigator.clipboard.writeText(url).then(() => {
    alert('Calendar feed URL copied!');
  });
}

