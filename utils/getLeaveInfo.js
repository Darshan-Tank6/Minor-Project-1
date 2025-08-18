const LeaveRequest = require("../models/leaveRequest");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Class = require("../models/Class");
const moment = require("moment");
// const { createCalendarEvent } = require("./googleCalendar");
const { createOrUpdateCalendarEvent } = require("./googleCalendar");
const User = require("../models/User");

require("dotenv").config(); // If using .env file

/**
 * Get list of subjects with schedule for students on leave across ALL classes (today)
 * @returns {Promise<Array>}
 */

async function getAllClassesLeaveSubjectsToday() {
  try {
    const todayDay = moment().format("dddd");
    const todayDate = moment().startOf("day");

    // Step 1: Get all classes
    const classes = await Class.find().lean();
    if (!classes || classes.length === 0) {
      console.log("❌ No classes found.");
      return [];
    }

    const finalResult = [];

    // Step 2: Process each class
    for (const cls of classes) {
      // 2a: Find students in this class
      const students = await Student.find({ classId: cls._id }).lean();
      if (!students || students.length === 0) continue;

      const studentIds = students.map((s) => s._id);

      // 2b: Find approved leave requests covering TODAY
      const leaves = await LeaveRequest.find({
        studentId: { $in: studentIds },
        status: "approved",
      })
        .populate("studentId", "email name")
        .lean();

      if (!leaves || leaves.length === 0) continue;

      // 2c: Get all subjects for this class
      const subjects = await Subject.find({ classId: cls._id }).lean();

      // 2d: Filter schedules for today's day
      const todaySubjects = subjects
        .map((sub) => {
          const schedules = sub.schedule.filter((sch) => sch.day === todayDay);
          return schedules.map((sch) => ({
            subject: sub.name,
            startTime: sch.startTime,
            endTime: sch.endTime,
            room: sch.room,
          }));
        })
        .flat();

      if (todaySubjects.length === 0) continue;

      // 2e: Match leave students with today’s subjects
      for (const leave of leaves) {
        const from = moment(leave.from_date, "YYYY-MM-DD").startOf("day");
        const to = moment(leave.to_date, "YYYY-MM-DD").endOf("day");

        if (!(todayDate.isSameOrAfter(from) && todayDate.isSameOrBefore(to))) {
          continue; // skip if today is not in leave duration
        }

        // for (const subj of todaySubjects) {
        //   finalResult.push({
        //     classId: cls._id,
        //     className: cls.name,
        //     studentId: leave.studentId._id,
        //     studentEmail: leave.studentId.email,
        //     subject: subj.subject,
        //     day: todayDay,
        //     startTime: subj.startTime,
        //     endTime: subj.endTime,
        //     room: subj.room,
        //   });
        // }
        for (const subj of todaySubjects) {
          const result = {
            classId: cls._id,
            className: cls.name,
            studentId: leave.studentId._id,
            studentEmail: leave.studentId.email,
            subject: subj.subject,
            day: todayDay,
            startTime: subj.startTime,
            endTime: subj.endTime,
            room: subj.room,
            date: todayDate.format("YYYY-MM-DD"),
          };

          finalResult.push(result);

          // 🔑 Get refresh token from your User model
          const user = await User.findOne({
            email: leave.studentId.email,
          }).lean();
          if (user && user.google?.refreshToken) {
            // await createCalendarEvent(
            //   result,
            //   user.google.refreshToken,
            //   leave.studentId.email
            // );
            await createOrUpdateCalendarEvent(
              result,
              user.google.refreshToken,
              leave.studentId.email
            );
          } else {
            console.warn(
              `⚠️ No refresh token found for ${leave.studentId.email}`
            );
          }
        }
      }
    }

    console.log(
      `✅ Found ${
        finalResult.length
      } subjects for students on leave today. todays date: ${todayDate.format(
        "YYYY-MM-DD"
      )}`
    );
    return finalResult;
  } catch (err) {
    console.error("⚠️ Error in getAllClassesLeaveSubjectsToday:", err);
    throw err;
  }
}

module.exports = { getAllClassesLeaveSubjectsToday };
