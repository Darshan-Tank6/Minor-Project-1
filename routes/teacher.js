const express = require("express");
const router = express.Router();
const College = require("../models/College.js");
const Department = require("../models/Department.js");
const Class = require("../models/Class.js");
const Subject = require("models/Subject.js");
const Teacher = require("models/Teacher.js");

//Add teacher in Department
router.post("department/teacher/create/:deptId", async (req, res) => {
  try {
    const { name, email } = req.body;
    const department = await Department.findById(req.params.deptId);

    const newTeacher = new Teacher({
      name: name,
      email: email,
      departmentId: department._id,
    });
    await newTeacher.save();
    res.redirect(`/admin/college/${department.collegeId}/departments`);
  } catch (error) {
    console.error("Error creating class:", err);
    res.status(500).send("Error creating class");
  }
});

//view Teacher in department
router.get("/department/:deptId/teachers", async (req, res) => {
  try {
    const department = await Department.findById(req.params.deptId).populate(
      "collegeId"
    );
    if (!department) return res.status(404).send("Department not found");
    const teachers = await Teacher.find({ departmentId: department._id });

    res.render("admin/viewTeacher", { department, teachers });
  } catch (err) {
    console.log("Error Fetching teacher: ", err);
    res.status(500).send("Error fetching Teachers");
  }
});

module.exports = router;
