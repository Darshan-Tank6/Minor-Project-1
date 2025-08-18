// // utils/googleCalendar.js
// const { google } = require("googleapis");

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// async function createCalendarEvent(subjectDetails, refreshToken, studentEmail) {
//   try {
//     oauth2Client.setCredentials({ refresh_token: refreshToken });

//     const calendar = google.calendar({ version: "v3", auth: oauth2Client });

//     const eventDate =
//       subjectDetails.date || new Date().toISOString().split("T")[0];
//     const startDateTime = new Date(
//       `${eventDate}T${subjectDetails.startTime}:00`
//     );
//     const endDateTime = new Date(`${eventDate}T${subjectDetails.endTime}:00`);

//     const event = {
//       summary: subjectDetails.subject,
//       location: subjectDetails.room,
//       description: `Class: ${subjectDetails.className}, Student: ${studentEmail}`,
//       start: {
//         dateTime: startDateTime.toISOString(),
//         timeZone: "Asia/Kolkata",
//       },
//       end: {
//         dateTime: endDateTime.toISOString(),
//         timeZone: "Asia/Kolkata",
//       },
//       attendees: [{ email: studentEmail }],
//     };

//     const response = await calendar.events.insert({
//       calendarId: "primary",
//       resource: event,
//     });

//     console.log(
//       `✅ Event created for ${studentEmail}: ${response.data.htmlLink}`
//     );
//     return response.data;
//   } catch (err) {
//     console.error(`❌ Error creating event for ${studentEmail}:`, err.message);
//   }
// }

// module.exports = { createCalendarEvent };

// utils/googleCalendar.js
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function createOrUpdateCalendarEvent(
  subjectDetails,
  refreshToken,
  studentEmail
) {
  try {
    // Authenticate AS the student (using their refresh token)
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const eventDate =
      subjectDetails.date || new Date().toISOString().split("T")[0];
    const startDateTime = new Date(
      `${eventDate}T${subjectDetails.startTime}:00`
    );
    const endDateTime = new Date(`${eventDate}T${subjectDetails.endTime}:00`);

    // Step 1: Search if event already exists in this time window
    const existingEvents = await calendar.events.list({
      calendarId: "primary",
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      q: subjectDetails.subject, // search by subject name
      singleEvents: true,
      orderBy: "startTime",
    });

    const eventResource = {
      summary: subjectDetails.subject,
      location: subjectDetails.room,
      description: `Class: ${subjectDetails.className}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
    };

    if (existingEvents.data.items.length > 0) {
      // Step 2: Update first matching event
      const eventId = existingEvents.data.items[0].id;
      const updated = await calendar.events.update({
        calendarId: "primary",
        eventId,
        resource: eventResource,
      });
      console.log(
        `♻️ Event updated for ${studentEmail}: ${updated.data.htmlLink}`
      );
      return updated.data;
    } else {
      // Step 3: Insert new event
      const created = await calendar.events.insert({
        calendarId: "primary",
        resource: eventResource,
      });
      console.log(
        `✅ Event created for ${studentEmail}: ${created.data.htmlLink}`
      );
      return created.data;
    }
  } catch (err) {
    console.error(
      `❌ Error creating/updating event for ${studentEmail}:`,
      err.message
    );
  }
}

module.exports = { createOrUpdateCalendarEvent };
