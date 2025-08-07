const express = require("express");
const router = express.Router();
const College = require("../models/College.js");
const Department = require("../models/Department.js");
const Class = require("../models/Class.js");
const Subject = require("../models/Subject.js");
const Teacher = require("../models/Teacher.js");

//teacher views
router.get("/view/classes", async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id })
    .populate("departmentId")
    .populate("assignedSubjects")
    .populate("userId");

  console.log("Teacher: ", teacher);
  res.render("teacher/viewClasses", { teacher });
});

module.exports = router;
