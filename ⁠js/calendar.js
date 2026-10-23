// For FullCalendar display - use HTTPS version of your Apple Calendar URL
const APPLE_ICAL_URL = 'https://p107-caldav.icloud.com/published/2/MjAwMjg2NzQzMDUyMDAyOIUdIi1NYG67iQ-qZPpE2RAOVKE6-QXI5ymE7vdPjQg9d9Fz-otfDBo7vQgOfGvLZjbhu11ueqEont0UGFHArLQ';

document.addEventListener('DOMContentLoaded', function() {
  // Initialize FullCalendar
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    events: function(info, successCallback, failureCallback) {
      fetch(APPLE_ICAL_URL)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(icsText => {
          const events = parseICS(icsText);
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
  calendar.render();
});

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
  // Handle formats like: DTSTART:20261025T100000Z or DTSTART;VALUE=DATE:20261028
  const match = dateString.match(/:(.*?)$/);
  if (!match) return null;
  
  let dateStr = match[1];
  
  // If it's a date-only format (VALUE=DATE)
  if (dateStr.length === 8) {
    return dateStr; // YYYYMMDD format
  }
  
  // If it's a datetime format
  if (dateStr.length >= 15) {
    // Convert from YYYYMMDDTHHMMSSZ to YYYY-MM-DDTHH:MM:SS
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

function copyToClipboard() {
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
}

function downloadICS() {
  // Fetch the iCal file using HTTPS URL
  fetch(APPLE_ICAL_URL)
    .then(response => response.text())
    .then(icsContent => {
      // Create a blob from the ICS content
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'calendar.ics';
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Error downloading calendar:', error);
      alert('Failed to download calendar. Please try copying the URL instead.');
    });
}
