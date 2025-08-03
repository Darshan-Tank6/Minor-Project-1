const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const path = require("path");
const moment = require("moment");
const { ensureAuthenticated, checkRole } = require("../middleware/auth");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// Show Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

// Handle Register Form Submission
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  // Simple validation
  if (!email || !password || !role) {
    return res.status(400).send("All fields are required");
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Create new user
    const newUser = new User({ email, passwordHash: password, role });
    await newUser.save();

    if (role === "teacher") {
      const newTeacher = new Teacher({
        email: email,
        userId: newUser._id,
      });
      await newTeacher.save();
    }

    if (role === "student") {
      const newStudent = new Student({
        email: email,
        userId: newUser._id,
      });
      await newStudent.save();
    }

    req.flash("success_msg", "Registration successful! You can now log in.");
    res.redirect("/auth/login");
  } catch (err) {
    console.error("Error registering user:", err);
    req.flash("error_msg", "Error registering user. Please try again.");
    res.redirect("/auth/register");
  }
});

// Show Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

// Handle Login Form Submission
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("admin/createCollege");
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success_msg", "You are logged out");
    res.redirect("/auth/login");
  });
});

module.exports = router;
