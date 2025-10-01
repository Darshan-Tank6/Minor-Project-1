// services/leaveSubjectsService.js
const LeaveRequest = require("../models/MeetLink");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Class = require("../models/Class");
const Teacher = require("../models/Teacher");
const User = require("../models/User");
const moment = require("moment");
const { createTeacherAndStudentEventsNew } = require("./calendarService");

async function getAllClassesLeaveSubjectsTodayNew() {
  try {
    const todayDay = moment().format("dddd");
    const todayDate = moment().startOf("day");

    const classes = await Class.find().lean();
    if (!classes || classes.length === 0) {
      console.log("❌ No classes found.");
      return [];
    }

    const finalResult = [];

    for (const cls of classes) {
      // --- Students in this class ---
      const students = await Student.find({ classId: cls._id }).lean();
      if (!students || students.length === 0) continue;

      const studentIds = students.map((s) => s._id);

      // --- Approved leaves covering today ---
      const leaves = await LeaveRequest.find({
        studentId: { $in: studentIds },
        status: "approved",
      })
        .populate("studentId", "email name")
        .lean();

      if (!leaves || leaves.length === 0) continue;

      // --- Subjects for this class ---
      const subjects = await Subject.find({ classId: cls._id }).lean();

      // --- Today’s subjects only ---
      const todaySubjects = subjects
        .map((sub) => {
          const schedules = sub.schedule.filter((sch) => sch.day === todayDay);
          return schedules.map((sch) => ({
            subjectId: sub._id,
            subject: sub.name,
            startTime: sch.startTime,
            endTime: sch.endTime,
            room: sch.room,
          }));
        })
        .flat();

      if (todaySubjects.length === 0) continue;

      // --- For each subject happening today ---
      for (const subj of todaySubjects) {
        // Find teacher assigned to this subject
        const teacher = await Teacher.findOne({
          assignedSubjects: subj.subjectId,
        }).populate("userId");
        if (!teacher) {
          console.warn(`⚠️ No teacher found for subject ${subj.subject}`);
          continue;
        }

        // Build subject details (for teacher + students)
        const subjectDetails = {
          classId: cls._id,
          className: cls.name,
          subjectId: subj.subjectId,
          subject: subj.subject,
          day: todayDay,
          startTime: subj.startTime,
          endTime: subj.endTime,
          room: subj.room,
          date: todayDate.format("YYYY-MM-DD"),
        };

        // Get all students on leave for today in this class
        const leaveStudents = leaves.filter((leave) => {
          const from = moment(leave.from_date, "YYYY-MM-DD").startOf("day");
          const to = moment(leave.to_date, "YYYY-MM-DD").endOf("day");
          return todayDate.isSameOrAfter(from) && todayDate.isSameOrBefore(to);
        });

        if (leaveStudents.length === 0) continue;

        // Teacher + student calendar sync
        await createTeacherAndStudentEventsNew(
          subjectDetails,
          teacher,
          leaveStudents
        );

        // Store results
        for (const leave of leaveStudents) {
          finalResult.push({
            ...subjectDetails,
            studentId: leave.studentId._id,
            studentEmail: leave.studentId.email,
          });
        }
      }
    }

    console.log(
      `✅ Found ${
        finalResult.length
      } subject entries for students on leave today. Date: ${todayDate.format(
        "YYYY-MM-DD"
      )}`
    );

    return finalResult;
  } catch (err) {
    console.error("⚠️ Error in getAllClassesLeaveSubjectsToday:", err);
    throw err;
  }
}

module.exports = { getAllClassesLeaveSubjectsTodayNew };
