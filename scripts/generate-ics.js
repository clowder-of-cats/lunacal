const fs = require('fs');
const path = require('path');

const events = JSON.parse(fs.readFileSync('data/events.json', 'utf8'));

let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//My Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:My Calendar
X-WR-TIMEZONE:America/Vancouver
`;

events.forEach(event => {
  const uid = `${event.id}@yourdomain.com`;
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtstart = event.allDay 
    ? event.start.replace(/-/g, '')
    : event.start.replace(/[-:]/g, '').split('.')[0];
  const dtend = event.end 
    ? (event.allDay ? event.end.replace(/-/g, '') : event.end.replace(/[-:]/g, '').split('.')[0])
    : '';

  icsContent += `
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART${event.allDay ? ';VALUE=DATE' : ''}:${dtstart}
${dtend ? `DTEND${event.allDay ? ';VALUE=DATE' : ''}:${dtend}` : ''}
SUMMARY:${event.title}
${event.description ? `DESCRIPTION:${event.description}` : ''}
END:VEVENT`;
});

icsContent += `
END:VCALENDAR`;

fs.writeFileSync('feeds/calendar.ics', icsContent);
console.log('Calendar feed generated successfully!');
