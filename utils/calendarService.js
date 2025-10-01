// services/calendarService.js
const { google } = require("googleapis");
const MeetLink = require("../models/MeetLink");
const User = require("../models/User");
const { decrypt } = require("../utils/cryptoVault");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function getGoogleAuth(user) {
  if (!user.google?.refreshTokenEnc || !user.google?.refreshTokenIv) {
    throw new Error(`No refresh token stored for ${user.email}`);
  }
  const { iv, tag } = JSON.parse(user.google.refreshTokenIv);
  const refreshToken = decrypt({
    ciphertext: user.google.refreshTokenEnc,
    iv,
    tag,
  });
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Create event in teacher calendar (with Meet) + add events to students
 */
async function createTeacherAndStudentEventsNew(
  subjectDetails,
  teacher,
  leaveStudents
) {
  try {
    // --- Teacher’s event ---
    const teacherUser = teacher.userId;
    const teacherCalendar = await getGoogleAuth(teacherUser);

    const eventDate = subjectDetails.date;
    const startDateTime = new Date(
      `${eventDate}T${subjectDetails.startTime}:00`
    );
    const endDateTime = new Date(`${eventDate}T${subjectDetails.endTime}:00`);

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

    const teacherEvent = await teacherCalendar.events.insert({
      calendarId: "primary",
      resource: eventResource,
      conferenceDataVersion: 1,
    });

    const meetLink = teacherEvent.data.hangoutLink;
    console.log(`🎓 Meet created by ${teacher.email}: ${meetLink}`);

    await MeetLink.findOneAndUpdate(
      { subject: subjectDetails.subject, classId: subjectDetails.classId },
      {
        meetLink,
        scheduledTime: startDateTime,
        $setOnInsert: { mailed: false },
      },
      { upsert: true, new: true }
    );

    // --- Student events with same link ---
    for (const leave of leaveStudents) {
      const studentUser = await User.findOne({ email: leave.studentId.email });
      if (!studentUser) continue;

      try {
        const studentCalendar = await getGoogleAuth(studentUser);

        const studentEvent = {
          ...eventResource,
          conferenceData: undefined, // 🚫 don’t create new Meet
          description: `Join teacher’s Meet: ${meetLink}\nClass: ${subjectDetails.className}`,
        };

        await studentCalendar.events.insert({
          calendarId: "primary",
          resource: studentEvent,
        });

        console.log(`👨‍🎓 Student ${leave.studentId.email} event created.`);
      } catch (err) {
        console.error(
          `⚠️ Failed to insert event for ${leave.studentId.email}:`,
          err.message
        );
      }
    }

    return teacherEvent.data;
  } catch (err) {
    console.error("❌ Error in createTeacherAndStudentEvents:", err.message);
  }
}

module.exports = { createTeacherAndStudentEventsNew };
