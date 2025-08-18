// passport.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
require("dotenv").config();

// ----------------------
// Local Strategy
// ----------------------
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// ----------------------
// Google OAuth Strategy
// ----------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback", // use env in production
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

        let user = await User.findOne({ email });

        if (!user) {
          // Determine role
          let role = "student";
          let teacherDoc = null;

          if (adminEmails.includes(email)) {
            console.log("Admin user detected:", email);
            role = "admin";
          } else {
            teacherDoc = await Teacher.findOne({ email });
            if (teacherDoc) {
              role = "teacher";
              console.log("teacher user detected:", teacherDoc);
            } else {
              console.log("teacher user not detected");
            }
          }

          // Create new user
          user = new User({
            email,
            role,
            google: {
              id: profile.id,
              refreshToken: refreshToken, // only first time
            },
          });
          await user.save();

          // Link teacher or student record
          if (role === "teacher" && teacherDoc) {
            teacherDoc.userId = user._id;
            await teacherDoc.save();
          }
          // else if (role === "student") {
          //   await new Student({
          //     userId: user._id,
          //     email, // ✅ optional but useful for quick lookups
          //   }).save();
          // }
        } else {
          // Update refresh token only if provided
          if (refreshToken) {
            user.google.refreshToken = refreshToken;
            await user.save();
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ----------------------
// Sessions
// ----------------------
// passport.serializeUser((user, done) => {
//   done(null, user.id); // store MongoDB _id
// });
passport.serializeUser((user, done) => {
  //   console.log("➡️ Serializing user:", user.id); // Debugging line
  done(null, user.id);
});

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });

passport.deserializeUser(async (id, done) => {
  //   console.log("⬅️ Deserializing user with ID:", id); // Debugging line
  try {
    const user = await User.findById(id);
    // console.log("⬅️ Found user:", user); // Debugging line
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
