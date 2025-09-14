// // scheduler.js
// const cron = require("node-cron");
// const MeetLink = require("./models/MeetLink"); // your MeetLink model
// const sendMail = require("./mailer");

// function startScheduler() {
//   // run every minute
//   cron.schedule("* * * * *", async () => {
//     const now = new Date();
//     const tenMinsLater = new Date(now.getTime() + 10 * 60000);

//     try {
//       const events = await MeetLink.find({
//         scheduledTime: { $gte: now, $lte: tenMinsLater },
//         mailed: false,
//       });

//       for (let event of events) {
//         const subject = `Reminder: ${event.title} starts soon`;
//         const text = `Your event "${event.title}" starts at ${event.scheduledTime}.\n\nJoin here: ${event.link}`;

//         await sendMail(event.emails, subject, text);

//         // update mailed flag
//         event.mailed = true;
//         await event.save();

//         console.log(`✅ Mail sent & updated for event: ${event.title}`);
//       }
//     } catch (err) {
//       console.error("❌ Scheduler error:", err);
//     }
//   });

//   console.log("📅 Scheduler started...");
// }

// module.exports = startScheduler;

// scheduler.js
const cron = require("node-cron");
const MeetLink = require("../models/MeetLink");
const sendMail = require("./mailer");

function startScheduler() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const tenMinsLater = new Date(now.getTime() + 10 * 60000);

    try {
      const events = await MeetLink.find({
        scheduledTime: { $gte: now, $lte: tenMinsLater },
        mailed: false,
      });

      for (let event of events) {
        const subject = `Reminder: ${event.subject} starts soon`;
        const text = `Your event "${event.subject}" starts at ${event.scheduledTime}.\n\nJoin here: ${event.meetLink}`;

        await sendMail([event.studentEmail], subject, text);

        event.mailed = true;
        await event.save();

        console.log(`✅ Mail sent & updated for event: ${event.subject}`);
      }
    } catch (err) {
      console.error("❌ Scheduler error:", err);
    }
  });

  console.log("📅 Scheduler started...");
}

module.exports = startScheduler;
