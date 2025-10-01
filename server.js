const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { startServer } = require("./utils/emailServices.js");
const { getAllClassesLeaveSubjectsToday } = require("./utils/getLeaveInfo.js");
const {
  getAllClassesLeaveSubjectsTodayNew,
} = require("./utils/leaveSubjectsService.js");
const startScheduler = require("./utils/scheduler.js");
const {
  ensureAuthenticated,
  checkRole,
  noCache,
} = require("./middleware/auth.js");

// Load Environment Variables
dotenv.config();

// Import Configurations
const connectDB = require("./config/db");
require("./config/passport"); // Load Passport strategy

// Import Routes
// const tipsRoutes = require("./routes/tips");
const authRoutes = require("./routes/auth");
const teacherRoutes = require("./routes/teacher");
const studentRoutes = require("./routes/student");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const {
  getAllClassesLeaveSubjectsTodayNew,
} = require("./utils/leaveSubjectsService.js");

const app = express();

// 📌 Connect to MongoDB
connectDB();

// 📌 Security Middlewares
// app.use(helmet()); // Secure HTTP headers
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'"],
//         styleSrc: ["'self'", "https://fonts.googleapis.com"],
//         fontSrc: ["'self'", "https://fonts.gstatic.com"],
//       },
//     },
//   })
// );

app.use(compression()); // Gzip compression for performance

// 📌 Rate Limiting (Prevents brute force attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// 📌 Session Setup (With Secure Cookie)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    // cookie: {
    //   secure: process.env.NODE_ENV === "production", // Set secure flag in production
    //   httpOnly: true, // Prevents client-side JS access
    //   sameSite: "strict", // Prevent CSRF attacks
    //   maxAge: 1000 * 60 * 60, // 1-hour session expiry
    // },
    cookie: { secure: false },
  })
);

// 📌 Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());
// ///debugging
// app.use((req, res, next) => {
//   console.log("Session:", req.session);
//   console.log("User in session:", req.user);
//   next();
// });

app.use(express.json()); // for JSON POST bodies
app.use(express.urlencoded({ extended: false })); // for form POST bodies

// 📌 Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(methodOverride("_method")); // Allow PUT/DELETE in forms
app.use(flash());

// 📌 View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 📌 Global Variables (Flash Messages)
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// 📌 Routes
app.use("/auth", noCache, authRoutes);
app.use("/teacher", ensureAuthenticated, noCache, teacherRoutes);
app.use("/student", ensureAuthenticated, noCache, studentRoutes);
app.use("/admin", ensureAuthenticated, noCache, adminRoutes);
app.use("/user", ensureAuthenticated, noCache, userRoutes);

// 📌 Home Route
app.get("/", (req, res) => res.redirect("/auth/login"));

// 📌 404 Error Handler
app.use((req, res) => {
  res.status(404).render("404", { title: "404 - Not Found" });
});

/// bot

startServer(); // Start the email automation server

/// bot end

///

// (async () => {
//   const data = await getAllClassesLeaveSubjectsToday();
//   // console.log(JSON.stringify(data, null, 2));
// })();

(async () => {
  const data = await getAllClassesLeaveSubjectsTodayNew();
  // console.log(JSON.stringify(data, null, 2));
})();

///

//scheduler

// startScheduler();
///

// 📌 Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
