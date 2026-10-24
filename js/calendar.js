// ─── URLs ────────────────────────────────────────────────────────────────────
const WEBCAL_URL = 'webcal://clowder-of-cats.github.io/lunacal/data/subscribe.ics';
const LOCAL_ICS_URL = 'data/events.ics';
// ─────────────────────────────────────────────────────────────────────────────


window.copyToClipboard = function() {
  navigator.clipboard.writeText(WEBCAL_URL).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = originalText; }, 2000);
  }).catch(err => {
    alert('Failed to copy. Please try again.');
  });
};

window.downloadICS = function() {
  fetch(LOCAL_ICS_URL)
    .then(response => response.text())
    .then(icsContent => {
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'calendar.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Error downloading calendar:', error);
      alert('Failed to download calendar. Please try copying the URL instead.');
    });
};


function parseICS(icsText) {
  const events = [];
  const lines = icsText.split('\n');
  let currentEvent = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (currentEvent.title) {
        events.push(currentEvent);
      }
    } else if (line.startsWith('SUMMARY:')) {
      currentEvent.title = line.substring(8);
    } else if (line.startsWith('DTSTART')) {
      currentEvent.start = parseDate(line);
    } else if (line.startsWith('DTEND')) {
      currentEvent.end = parseDate(line);
    } else if (line.startsWith('DESCRIPTION:')) {
      currentEvent.description = line.substring(12);
    }
  }

  return events;
}

function parseDate(dateString) {
  const match = dateString.match(/:(.*?)$/);
  if (!match) return null;

  let dateStr = match[1].trim();

  if (dateStr.length === 8) {
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }

  if (dateStr.length >= 15) {
    const year   = dateStr.substring(0, 4);
    const month  = dateStr.substring(4, 6);
    const day    = dateStr.substring(6, 8);
    const hour   = dateStr.substring(9, 11);
    const minute = dateStr.substring(11, 13);
    const second = dateStr.substring(13, 15);
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  return dateStr;
}


// ─── Calendar init ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing calendar...');

  var calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
    console.error('Calendar element not found!');
    return;
  }

  // Detect mobile on load
  const isMobile = window.innerWidth < 640;

  const mobileToolbar = {
    left:   'prev,next',
    center: 'title',
    right:  'today,listMonth,dayGridMonth'
  };

  const desktopToolbar = {
    left:   'prev,next today',
    center: 'title',
    right:  'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
  };

  var calendar = new FullCalendar.Calendar(calendarEl, {

    // List view on mobile — full event names, no truncation
    initialView:  isMobile ? 'listMonth' : 'dayGridMonth',
    headerToolbar: isMobile ? mobileToolbar : desktopToolbar,

    // Swap toolbar and view when screen is resized
    windowResize: function() {
      const nowMobile = window.innerWidth < 640;
      calendar.setOption('headerToolbar', nowMobile ? mobileToolbar : desktopToolbar);
      if (nowMobile && ['timeGridWeek', 'timeGridDay'].includes(calendar.view.type)) {
        calendar.changeView('listMonth');
      }
    },

    // Colour events by production stage keyword
    eventDidMount: function(info) {
      const title = info.event.title.toLowerCase();
      const el    = info.el;

if (title.includes('open') || title.includes('drop')) {
  el.style.backgroundColor = '#6B8F71'; // sage green — drop/open
  el.style.borderColor     = '#6B8F71';
} else if (title.includes('roasting')) {
  el.style.backgroundColor = '#B5714A'; // terra cotta — roasting
  el.style.borderColor     = '#B5714A';
} else if (title.includes('ship') || title.includes('dispatch')) {
  el.style.backgroundColor = '#C4956A'; // warm amber — dispatch
  el.style.borderColor     = '#C4956A';
} else if (title.includes('paused') || title.includes('closed')) {
  el.style.backgroundColor = '#8A8E8E'; // cool grey — paused
  el.style.borderColor     = '#8A8E8E';
}

    },

    events: function(info, successCallback, failureCallback) {
      console.log('Fetching events from:', LOCAL_ICS_URL);
      fetch(LOCAL_ICS_URL)
        .then(response => {
          console.log('Response status:', response.status);
          if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
          }
          return response.text();
        })
        .then(icsText => {
          console.log('ICS text received, length:', icsText.length);
          const events = parseICS(icsText);
          console.log('Parsed events:', events);
          successCallback(events);
        })
        .catch(error => {
          console.error('Error fetching calendar:', error);
          failureCallback(error);
        });
    },

    editable:      false,
    selectable:    false,
    eventDisplay:  'block',
    height:        'auto',
    contentHeight: 'auto'
  });

  console.log('Calendar rendering...');
  calendar.render();
  console.log('Calendar rendered!');
});
