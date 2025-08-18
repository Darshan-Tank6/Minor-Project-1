const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const path = require("path");
const moment = require("moment");
const { ensureAuthenticated, checkRole } = require("../middleware/auth");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const { userInfo } = require("os");

// Show Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

// Handle Register Form Submission
// if (role === "teacher") {
//   const newTeacher = new Teacher({
//     email: email,
//     userId: newUser._id,
//   });
//   await newTeacher.save();
// }

// if (role === "student") {
//   const newStudent = new Student({
//     email: email,
//     userId: newUser._id,
//   });
//   await newStudent.save();
// }

//google login and register
// Start Google login
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar", // Calendar access
    ],
    accessType: "offline", // ensures refreshToken
    prompt: "consent", // always ask permission
  })
);

// Google callback
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/auth/login",
//     failureFlash: true,
//   }),
//   (req, res) => {
//     // Successful login
//     res.redirect("/auth/dashboard");
//   }
// );

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/register",
    failureFlash: true,
    // successRedirect: "/auth/dashboard",
  }),
  (req, res) => {
    // Redirect after login/register
    // console.log("✅ Google login success:", req.user);
    res.redirect("/auth/dashboard");
    // res.redirect("/admin/college/create");
  }
);

// // Handle Register Form Submission
// router.post("/register", async (req, res) => {
//   const { email, password, role } = req.body;

//   // Simple validation
//   if (!email || !password || !role) {
//     return res.status(400).send("All fields are required");
//   }

//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).send("User already exists");
//     }

//     const teacher = await Teacher.findOne({ email });
//     const newUser = new User({ email, passwordHash: password });

//     if (teacher) {
//       newUser.role = "teacher";
//       await newUser.save();
//       teacher.userId = newUser._id;
//       await teacher.save();
//     } else {
//       newUser.role = role;
//       await newUser.save();
//       if (role === "student") {
//         const newStudent = new Student({ userId: newUser._id });
//         await newStudent.save();
//       }
//     }

//     // Create new user

//     req.flash("success_msg", "Registration successful! You can now log in.");
//     res.redirect("/auth/login");
//   } catch (err) {
//     console.error("Error registering user:", err);
//     req.flash("error_msg", "Error registering user. Please try again.");
//     res.redirect("/auth/register");
//   }
// });

//"/register" route to handle user registration
const adminEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim())
  : [];

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Decide role
    let role = "student";
    const teacher = await Teacher.findOne({ email });

    if (adminEmails.includes(email)) {
      role = "admin";
    } else if (teacher) {
      role = "teacher";
    }

    // Create User
    const newUser = new User({
      email,
      passwordHash,
      role,
    });
    await newUser.save();

    // Link Teacher or Student collection
    if (role === "teacher" && teacher) {
      teacher.userId = newUser._id;
      await teacher.save();
    } else if (role === "student") {
      const newStudent = new Student({ userId: newUser._id });
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
    successRedirect: "/auth/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  console.log("User in session:", req.user);
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
