// routes/student.js
const express = require("express");
const router = express.Router();
const College = require("../models/College.js");
const Department = require("../models/Department.js");
const Class = require("../models/Class.js");
const Subject = require("../models/Subject.js");
const Teacher = require("../models/Teacher.js");
const Student = require("../models/Student.js");
const User = require("../models/User.js");
// router.get("/add-college-details", async (req, res) => {
//   const colleges = College.find();
//   res.render("student/enterStudentDetails", { colleges });
// });

router.get("/add-college-details", async (req, res) => {
  try {
    const colleges = await College.find();
    const departments = await Department.find().populate("collegeId");
    const classes = await Class.find().populate("departmentId");
    // console.log(colleges);
    res.render("student/enterStudentDetails", {
      colleges,
      departments,
      classes,
    });
  } catch (err) {
    console.error("Error fetching colleges:", err);
    res.status(500).send("Error fetching colleges");
  }
});

router.get("/student-form", async (req, res) => {
  const colleges = await College.find();
  res.render("student/student-form", { colleges });
});

router.get("/get-colleges", async (req, res) => {
  const colleges = await College.find();
  res.render("student/enterStudentDeails", { colleges });
});

router.get("/departments/:collegeId", async (req, res) => {
  const departments = await Department.find({
    collegeId: req.params.collegeId,
  });
  res.json(departments);
});

router.get("/classes/:departmentId", async (req, res) => {
  const classes = await Class.find({ departmentId: req.params.departmentId });
  res.json(classes);
});

router.post("/submit-student-form", async (req, res) => {
  try {
    const { college, department, classid, rollno, name } = req.body;

    const user = await User.findById(req.user._id);

    let existingStudent = await Student.findOne({
      email: user.email,
    });

    const newStudent = new Student({
      name: name,
      rollNumber: rollno,
      email: req.user.email,
      classId: classid,
      departmentId: department,
      year: classid.year,
      userId: req.user._id,
    });
    await newStudent.save();
    res.redirect("/student/student-form");
    // res.send(req.body); // for testing
  } catch (error) {
    console.log("Error: ", error);
    res.redirect("/student/student-form");
  }
});

// View Profile
router.get("/view-profile", async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate("classId")
      .populate("departmentId")
      .populate("userId")
      .populate({
        path: "classId",
        populate: {
          path: "subjects",
          populate: [
            {
              path: "teachingProfId",
              select: "name email",
              strictPopulate: false,
            },
            {
              path: "assistantProfId",
              select: "name email",
              strictPopulate: false,
            },
          ],
        },
      });

    // .populate("collegeId");

    if (!student) {
      return res.status(404).send("Student not found");
    }

    // console.log("Error: ", student);
    res.render("student/viewProfile", { student });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).send("Error fetching student profile");
  }
});

//////////////////////

// --- utils ---
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function computeLecturePosition(start, end) {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const duration = endMin - startMin;

  // scale: 30min = 1rem
  const remPerMin = 1 / 30;
  const top = startMin * remPerMin;
  const height = duration * remPerMin;

  return { top, height };
}

router.get("/dashboard", async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate({
      path: "classId",
      populate: {
        path: "subjects",
        populate: {
          path: "teachingProfId",
          select: "name email",
        },
      },
    });

    if (!student || !student.classId) {
      return res.status(404).send("Class not found for student");
    }

    const subjects = student.classId.subjects;
    const weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const calendar = {};
    weekDays.forEach((day) => {
      calendar[day] = [];
    });

    subjects.forEach((subject) => {
      subject.schedule?.forEach((lec) => {
        const pos = computeLecturePosition(lec.startTime, lec.endTime);
        calendar[lec.day].push({
          subject: subject.name,
          teacher: subject.teachingProfId ? subject.teachingProfId.name : "TBA",
          startTime: lec.startTime,
          endTime: lec.endTime,
          room: lec.room,
          top: pos.top,
          height: pos.height,
        });
      });
    });

    // sort lectures in each day
    weekDays.forEach((day) => {
      calendar[day].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
    });

    const today = weekDays[new Date().getDay()];
    const todaysLectures = calendar[today] || [];

    res.render("student/dashboard2", {
      calendar,
      subjects,
      todaysLectures,
      today,
      weekDays,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
});

/////////////////////

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function sortByTime(lectures) {
  return lectures.sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
}

router.get("/dashboard4", async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate({
      path: "classId",
      populate: {
        path: "subjects",
        populate: {
          path: "teachingProfId",
          select: "name email",
        },
      },
    });

    if (!student || !student.classId) {
      return res.status(404).send("Class not found for student");
    }

    const subjects = student.classId.subjects;
    const weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const calendar = {};
    weekDays.forEach((day) => {
      calendar[day] = [];
    });

    let allLectures = [];

    subjects.forEach((subject) => {
      if (subject.schedule && subject.schedule.length > 0) {
        subject.schedule.forEach((lec) => {
          const lectureData = {
            subject: subject.name,
            subjectId: subject._id,
            teacher: subject.teachingProfId
              ? subject.teachingProfId.name
              : "TBA",
            day: lec.day,
            startTime: lec.startTime,
            endTime: lec.endTime,
            room: lec.room,
          };
          calendar[lec.day].push(lectureData);
          allLectures.push(lectureData);
        });
      }
    });

    // Sort each day’s lectures
    weekDays.forEach((day) => {
      calendar[day] = sortByTime(calendar[day]);
    });

    // Today’s lectures
    const today = weekDays[new Date().getDay()];
    const todaysLectures = calendar[today] || [];

    // Next upcoming lecture (compare to current time)
    const nowMinutes = timeToMinutes(
      new Date().getHours() + ":" + new Date().getMinutes()
    );
    let nextLecture = null;

    if (todaysLectures.length > 0) {
      nextLecture = todaysLectures.find(
        (lec) => timeToMinutes(lec.startTime) > nowMinutes
      );
    }

    res.render("student/dashboard", {
      calendar,
      subjects,
      todaysLectures,
      today,
      nextLecture,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
});

function sortByTime(lectures) {
  return lectures.sort((a, b) => {
    const t1 = a.startTime.split(":").map(Number);
    const t2 = b.startTime.split(":").map(Number);
    return t1[0] - t2[0] || t1[1] - t2[1]; // compare hours then minutes
  });
}

router.get("/dashboard2", async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate({
      path: "classId",
      populate: {
        path: "subjects",
        populate: {
          path: "teachingProfId",
          select: "name email",
        },
      },
    });

    if (!student || !student.classId) {
      return res.status(404).send("Class not found for student");
    }

    const subjects = student.classId.subjects;
    const weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const calendar = {};
    weekDays.forEach((day) => {
      calendar[day] = [];
    });

    subjects.forEach((subject) => {
      if (subject.schedule && subject.schedule.length > 0) {
        subject.schedule.forEach((lec) => {
          calendar[lec.day].push({
            subject: subject.name,
            subjectId: subject._id,
            teacher: subject.teachingProfId
              ? subject.teachingProfId.name
              : "TBA",
            startTime: lec.startTime,
            endTime: lec.endTime,
            room: lec.room,
          });
        });
      }
    });

    // Sort each day’s lectures by time
    weekDays.forEach((day) => {
      calendar[day] = sortByTime(calendar[day]);
    });

    // Today’s lectures
    const today = weekDays[new Date().getDay()];
    const todaysLectures = calendar[today] || [];

    res.render("student/dashboard", {
      calendar,
      subjects,
      todaysLectures,
      today,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
});

// View All lectures for one subject
router.get("/subject/:id", async (req, res) => {
  try {
    const subjectId = req.params.id;

    const student = await Student.findOne({ userId: req.user._id }).populate({
      path: "classId",
      populate: {
        path: "subjects",
        populate: {
          path: "teachingProfId",
          select: "name email",
        },
      },
    });

    if (!student || !student.classId) {
      return res.status(404).send("Class not found for student");
    }

    const subject = student.classId.subjects.find(
      (sub) => sub._id.toString() === subjectId
    );

    if (!subject) {
      return res.status(404).send("Subject not found");
    }

    // Sort schedule
    const lectures = sortByTime(
      subject.schedule.map((lec) => ({
        day: lec.day,
        startTime: lec.startTime,
        endTime: lec.endTime,
        room: lec.room,
        teacher: subject.teachingProfId ? subject.teachingProfId.name : "TBA",
      }))
    );

    res.render("student/viewSubject", { subject, lectures });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading subject details");
  }
});

///////////////////////////////

router.get("/dashboard1", async (req, res) => {
  try {
    // Find logged-in student with class and subjects populated
    const student = await Student.findOne({ userId: req.user._id }).populate({
      path: "classId",
      populate: {
        path: "subjects",
        populate: {
          path: "teachingProfId", // populate teacher info
          select: "name email",
        },
      },
    });

    if (!student || !student.classId) {
      return res.status(404).send("Class not found for student");
    }

    const subjects = student.classId.subjects;

    // Build weekly calendar
    const weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const calendar = {};
    weekDays.forEach((day) => {
      calendar[day] = [];
    });

    subjects.forEach((subject) => {
      if (subject.schedule && subject.schedule.length > 0) {
        subject.schedule.forEach((lec) => {
          calendar[lec.day].push({
            subject: subject.name,
            teacher: subject.teachingProfId
              ? subject.teachingProfId.name
              : "TBA",
            startTime: lec.startTime,
            endTime: lec.endTime,
            room: lec.room,
          });
        });
      }
    });

    // Today's lectures
    const today = weekDays[new Date().getDay()];
    const todaysLectures = calendar[today] || [];

    res.render("student/dashboard", {
      calendar,
      subjects,
      todaysLectures,
      today,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
});

module.exports = router;
