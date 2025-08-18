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

module.exports = router;
