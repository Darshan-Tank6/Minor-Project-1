const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const { ensureAuthenticated, checkRole } = require("../middleware/auth");

router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.render("dashboard", { user: req.user });
    } else if (req.user.role === "teacher") {
      //   const teacher = await Teacher.findOne({ userId: req.user.id })
      //     .populate("assignedSubjects")
      //     .populate("departmentId");

      const teacher = await Teacher.findOne({ userId: req.user.id })
        .populate("departmentId")
        .populate({
          path: "assignedSubjects",
          populate: [
            {
              path: "teachingProfId",
              select: "name email",
            },
            {
              path: "assistantProfId",
              select: "name email",
            },
          ],
        });

      return res.render("dashboard", { user: req.user, teacher });
    } else if (req.user.role === "student") {
      //   const student = await Student.findOne({ userId: req.user.id })
      //     .populate("classId")
      //     .populate("subjects");
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

      return res.render("dashboard", { user: req.user, student });
    }

    res.render("dashboard", { user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
