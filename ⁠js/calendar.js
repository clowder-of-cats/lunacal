// For FullCalendar display - use HTTPS version of your Apple Calendar URL
const APPLE_ICAL_URL = 'https://p107-caldav.icloud.com/published/2/MjAwMjg2NzQzMDUyMDAyOIUdIi1NYG67iQ-qZPpE2RAOVKE6-QXI5ymE7vdPjQg9d9Fz-otfDBo7vQgOfGvLZjbhu11ueqEont0UGFHArLQ';

// Global functions for buttons
window.copyToClipboard = function() {
  const url = document.getElementById('ical-url').textContent;
  navigator.clipboard.writeText(url).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    alert('Failed to copy. Please try again.');
  });
};

window.downloadICS = function() {
  fetch(APPLE_ICAL_URL)
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

// Simple ICS parser
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
  
  let dateStr = match[1];
  
  if (dateStr.length === 8) {
    return dateStr;
  }
  
  if (dateStr.length >= 15) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(9, 11);
    const minute = dateStr.substring(11, 13);
    const second = dateStr.substring(13, 15);
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }
  
  return dateStr;
}

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing calendar...');
  
  var calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
    console.error('Calendar element not found!');
    return;
  }
  
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    events: function(info, successCallback, failureCallback) {
      console.log('Fetching events from:', APPLE_ICAL_URL);
      fetch(APPLE_ICAL_URL)
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
    editable: false,
    selectable: false,
    eventDisplay: 'block',
    height: 'auto',
    contentHeight: 'auto'
  });
  
  console.log('Calendar rendering...');
  calendar.render();
  console.log('Calendar rendered!');
});
