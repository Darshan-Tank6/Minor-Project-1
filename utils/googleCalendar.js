// // utils/googleCalendar.js
// const { google } = require("googleapis");
//
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );
//
// async function createCalendarEvent(subjectDetails, refreshToken, studentEmail) {
//   try {
//     oauth2Client.setCredentials({ refresh_token: refreshToken });
//
//     const calendar = google.calendar({ version: "v3", auth: oauth2Client });
//
//     const eventDate =
//       subjectDetails.date || new Date().toISOString().split("T")[0];
//     const startDateTime = new Date(
//       `${eventDate}T${subjectDetails.startTime}:00`
//     );
//     const endDateTime = new Date(`${eventDate}T${subjectDetails.endTime}:00`);
//
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
//
//     const response = await calendar.events.insert({
//       calendarId: "primary",
//       resource: event,
//     });
//
//     console.log(
//       `✅ Event created for ${studentEmail}: ${response.data.htmlLink}`
//     );
//     return response.data;
//   } catch (err) {
//     console.error(`❌ Error creating event for ${studentEmail}:`, err.message);
//   }
// }
//
// module.exports = { createCalendarEvent };

// // utils/googleCalendar.js
// const { google } = require("googleapis");
// const {decrypt, encrypt} = require("./cryptoVault");

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// async function createOrUpdateCalendarEvent(
//   subjectDetails,
//   refreshToken,
//   studentEmail
// ) {
//   try {
//     // Authenticate AS the student (using their refresh token)
//     oauth2Client.setCredentials({ refresh_token: refreshToken });
//     const calendar = google.calendar({ version: "v3", auth: oauth2Client });

//     const eventDate =
//       subjectDetails.date || new Date().toISOString().split("T")[0];
//     const startDateTime = new Date(
//       `${eventDate}T${subjectDetails.startTime}:00`
//     );
//     const endDateTime = new Date(`${eventDate}T${subjectDetails.endTime}:00`);

//     // Step 1: Search if event already exists in this time window
//     const existingEvents = await calendar.events.list({
//       calendarId: "primary",
//       timeMin: startDateTime.toISOString(),
//       timeMax: endDateTime.toISOString(),
//       q: subjectDetails.subject, // search by subject name
//       singleEvents: true,
//       orderBy: "startTime",
//     });

//     const eventResource = {
//       summary: subjectDetails.subject,
//       location: subjectDetails.room,
//       description: `Class: ${subjectDetails.className}`,
//       start: {
//         dateTime: startDateTime.toISOString(),
//         timeZone: "Asia/Kolkata",
//       },
//       end: {
//         dateTime: endDateTime.toISOString(),
//         timeZone: "Asia/Kolkata",
//       },
//     };

//     if (existingEvents.data.items.length > 0) {
//       // Step 2: Update first matching event
//       const eventId = existingEvents.data.items[0].id;
//       const updated = await calendar.events.update({
//         calendarId: "primary",
//         eventId,
//         resource: eventResource,
//       });
//       console.log(
//         `♻️ Event updated for ${studentEmail}: ${updated.data.htmlLink}`
//       );
//       return updated.data;
//     } else {
//       // Step 3: Insert new event
//       const created = await calendar.events.insert({
//         calendarId: "primary",
//         resource: eventResource,
//       });
//       console.log(
//         `✅ Event created for ${studentEmail}: ${created.data.htmlLink}`
//       );
//       return created.data;
//     }
//   } catch (err) {
//     console.error(
//       `❌ Error creating/updating event for ${studentEmail}:`,
//       err.message
//     );
//   }
// }

// module.exports = { createOrUpdateCalendarEvent };

// const { google } = require("googleapis");
// const MeetLink = require("../models/MeetLink"); // your Mongoose model

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// async function createOrUpdateCalendarEvent(
//   subjectDetails,
//   refreshToken,
//   studentEmail
// ) {
//   try {
//     oauth2Client.setCredentials({ refresh_token: refreshToken });
//     const calendar = google.calendar({ version: "v3", auth: oauth2Client });

//     const eventDate =
//       subjectDetails.date || new Date().toISOString().split("T")[0];
//     const startDateTime = new Date(
//       `${eventDate}T${subjectDetails.startTime}:00`
//     );
//     const endDateTime = new Date(`${eventDate}T${subjectDetails.endTime}:00`);

//     // Step 1: Search existing events
//     const existingEvents = await calendar.events.list({
//       calendarId: "primary",
//       timeMin: startDateTime.toISOString(),
//       timeMax: endDateTime.toISOString(),
//       q: subjectDetails.subject,
//       singleEvents: true,
//       orderBy: "startTime",
//     });

//     // Step 2: Prepare event resource with Meet
//     const eventResource = {
//       summary: subjectDetails.subject,
//       location: subjectDetails.room,
//       description: `Class: ${subjectDetails.className}`,
//       start: {
//         dateTime: startDateTime.toISOString(),
//         timeZone: "Asia/Kolkata",
//       },
//       end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Kolkata" },
//       conferenceData: {
//         createRequest: {
//           requestId: `meet-${Date.now()}`, // unique request ID
//           conferenceSolutionKey: { type: "hangoutsMeet" },
//         },
//       },
//     };

//     let eventResponse;
//     if (existingEvents.data.items.length > 0) {
//       // Update event
//       const eventId = existingEvents.data.items[0].id;
//       eventResponse = await calendar.events.update({
//         calendarId: "primary",
//         eventId,
//         resource: eventResource,
//         conferenceDataVersion: 1,
//       });
//       console.log(
//         `♻️ Event updated for ${studentEmail}: ${eventResponse.data.htmlLink}`
//       );
//     } else {
//       // Create new event
//       eventResponse = await calendar.events.insert({
//         calendarId: "primary",
//         resource: eventResource,
//         conferenceDataVersion: 1,
//       });
//       console.log(
//         `✅ Event created for ${studentEmail}: ${eventResponse.data.htmlLink}`
//       );
//     }

//     // Step 3: Save the Meet link in DB
//     const meetLink = eventResponse.data.hangoutLink;
//     if (meetLink) {
//       await MeetLink.findOneAndUpdate(
//         { studentEmail, subject: subjectDetails.subject },
//         { meetLink },
//         { upsert: true, new: true }
//       );
//       console.log(`🔗 Meet link stored for ${studentEmail}: ${meetLink}`);
//     }

//     return eventResponse.data;
//   } catch (err) {
//     console.error(
//       `❌ Error creating/updating event for ${studentEmail}:`,
//       err.message
//     );
//   }
// }

// module.exports = { createOrUpdateCalendarEvent };

///////////////////////////////////////////////////////////
// const { google } = require("googleapis");
// const MeetLink = require("../models/MeetLink");
// const User = require("../models/User"); // adjust path if different
// const { decrypt } = require("../utils/cryptoVault"); // adjust path

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// async function createOrUpdateCalendarEvent(subjectDetails, studentEmail) {
//   try {
//     // 🔑 Fetch user to get encrypted refresh token
//     const user = await User.findOne({ email: studentEmail });
//     if (
//       !user ||
//       !user.google?.refreshTokenEnc ||
//       !user.google?.refreshTokenIv
//     ) {
//       throw new Error("No refresh token stored for this user");
//     }

//     // 🔓 Decrypt refresh token
//     const { iv, tag } = JSON.parse(user.google.refreshTokenIv);
//     const decryptedRefreshToken = decrypt({
//       ciphertext: user.google.refreshTokenEnc,
//       iv,
//       tag,
//     });

//     // 🔐 Authenticate with Google
//     oauth2Client.setCredentials({ refresh_token: decryptedRefreshToken });
//     const calendar = google.calendar({ version: "v3", auth: oauth2Client });

//     const eventDate =
//       subjectDetails.date || new Date().toISOString().split("T")[0];
//     const startDateTime = new Date(
//       `${eventDate}T${subjectDetails.startTime}:00`
//     );
//     const endDateTime = new Date(`${eventDate}T${subjectDetails.endTime}:00`);

//     // 🔍 Search existing events
//     const existingEvents = await calendar.events.list({
//       calendarId: "primary",
//       timeMin: startDateTime.toISOString(),
//       timeMax: endDateTime.toISOString(),
//       q: subjectDetails.subject,
//       singleEvents: true,
//       orderBy: "startTime",
//     });

//     // 📅 Event resource with Meet link
//     const eventResource = {
//       summary: subjectDetails.subject,
//       location: subjectDetails.room,
//       description: `Class: ${subjectDetails.className}`,
//       start: {
//         dateTime: startDateTime.toISOString(),
//         timeZone: "Asia/Kolkata",
//       },
//       end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Kolkata" },
//       conferenceData: {
//         createRequest: {
//           requestId: `meet-${Date.now()}`,
//           conferenceSolutionKey: { type: "hangoutsMeet" },
//         },
//       },
//     };

//     let eventResponse;
//     if (existingEvents.data.items.length > 0) {
//       const eventId = existingEvents.data.items[0].id;
//       eventResponse = await calendar.events.update({
//         calendarId: "primary",
//         eventId,
//         resource: eventResource,
//         conferenceDataVersion: 1,
//       });
//       console.log(
//         `♻️ Event updated for ${studentEmail}: ${eventResponse.data.htmlLink}`
//       );
//     } else {
//       eventResponse = await calendar.events.insert({
//         calendarId: "primary",
//         resource: eventResource,
//         conferenceDataVersion: 1,
//       });
//       console.log(
//         `✅ Event created for ${studentEmail}: ${eventResponse.data.htmlLink}`
//       );
//     }

//     // 🔗 Save Meet link
//     const meetLink = eventResponse.data.hangoutLink;
//     if (meetLink) {
//       await MeetLink.findOneAndUpdate(
//         { studentEmail, subject: subjectDetails.subject },
//         { meetLink },
//         { upsert: true, new: true }
//       );
//       console.log(`🔗 Meet link stored for ${studentEmail}: ${meetLink}`);
//     }

//     return eventResponse.data;
//   } catch (err) {
//     if (err.message.includes("invalid_grant")) {
//       console.error(
//         `⚠️ Refresh token invalid for ${studentEmail}, clearing from DB`
//       );
//       await User.updateOne(
//         { email: studentEmail },
//         { $unset: { "google.refreshTokenEnc": 1, "google.refreshTokenIv": 1 } }
//       );
//       // Next time this user logs in, a fresh refresh token will be stored
//     } else {
//       console.error(
//         `❌ Error creating/updating event for ${studentEmail}:`,
//         err.message
//       );
//     }
//   }
// }

// module.exports = { createOrUpdateCalendarEvent };

// services/calendarService.js
const { google } = require("googleapis");
const MeetLink = require("../models/MeetLink");
const User = require("../models/User"); // adjust path if different
const { decrypt } = require("../utils/cryptoVault"); // adjust path

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function createOrUpdateCalendarEvent(subjectDetails, studentEmail) {
  try {
    // 🔑 Fetch user to get encrypted refresh token
    const user = await User.findOne({ email: studentEmail });
    if (
      !user ||
      !user.google?.refreshTokenEnc ||
      !user.google?.refreshTokenIv
    ) {
      throw new Error("No refresh token stored for this user");
    }

    // 🔓 Decrypt refresh token
    const { iv, tag } = JSON.parse(user.google.refreshTokenIv);
    const decryptedRefreshToken = decrypt({
      ciphertext: user.google.refreshTokenEnc,
      iv,
      tag,
    });

    // 🔐 Authenticate with Google
    oauth2Client.setCredentials({ refresh_token: decryptedRefreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Dates
    const eventDate =
      subjectDetails.date || new Date().toISOString().split("T")[0];
    const startDateTime = new Date(
      `${eventDate}T${subjectDetails.startTime}:00`
    );
    const endDateTime = new Date(`${eventDate}T${subjectDetails.endTime}:00`);

    // 🔍 Search existing events
    const existingEvents = await calendar.events.list({
      calendarId: "primary",
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      q: subjectDetails.subject,
      singleEvents: true,
      orderBy: "startTime",
    });

    // 📅 Event resource with Meet link
    const eventResource = {
      summary: subjectDetails.subject,
      location: subjectDetails.room,
      description: `Class: ${subjectDetails.className}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Kolkata" },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    let eventResponse;
    if (existingEvents.data.items.length > 0) {
      const eventId = existingEvents.data.items[0].id;
      eventResponse = await calendar.events.update({
        calendarId: "primary",
        eventId,
        resource: eventResource,
        conferenceDataVersion: 1,
      });
      console.log(
        `♻️ Event updated for ${studentEmail}: ${eventResponse.data.htmlLink}`
      );
    } else {
      eventResponse = await calendar.events.insert({
        calendarId: "primary",
        resource: eventResource,
        conferenceDataVersion: 1,
      });
      console.log(
        `✅ Event created for ${studentEmail}: ${eventResponse.data.htmlLink}`
      );
    }

    // 🔗 Save Meet link with scheduledTime
    const meetLink = eventResponse.data.hangoutLink;
    if (meetLink) {
      await MeetLink.findOneAndUpdate(
        { studentEmail, subject: subjectDetails.subject },
        {
          meetLink,
          scheduledTime: startDateTime,
          $setOnInsert: { mailed: false }, // don’t overwrite if already mailed
        },
        { upsert: true, new: true }
      );

      console.log(
        `🔗 Meet link stored for ${studentEmail}: ${meetLink} (at ${startDateTime})`
      );
    }

    return eventResponse.data;
  } catch (err) {
    if (err.message.includes("invalid_grant")) {
      console.error(
        `⚠️ Refresh token invalid for ${studentEmail}, clearing from DB`
      );
      await User.updateOne(
        { email: studentEmail },
        { $unset: { "google.refreshTokenEnc": 1, "google.refreshTokenIv": 1 } }
      );
      // Next time this user logs in, a fresh refresh token will be stored
    } else {
      console.error(
        `❌ Error creating/updating event for ${studentEmail}:`,
        err.message
      );
    }
  }
}

module.exports = { createOrUpdateCalendarEvent };
