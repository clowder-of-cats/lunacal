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
    events: APPLE_ICAL_URL,
    editable: false,
    selectable: false,
    eventDisplay: 'block',
    height: 'auto',
    contentHeight: 'auto'
  });
  calendar.render();
});

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
