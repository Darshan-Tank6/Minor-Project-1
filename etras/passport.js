// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const User = require("../models/User");

// passport.use(
//   new LocalStrategy(
//     { usernameField: "email" },
//     async (email, password, done) => {
//       try {
//         const user = await User.findOne({ email });

//         if (!user || !(await user.comparePassword(password))) {
//           return done(null, false, { message: "Invalid email or password" });
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });

// passport.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
require("dotenv").config(); // If using .env file

// Local strategy (keep if you still want local login)
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

// ✅ Google OAuth Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//       passReqToCallback: true,
//     },
//     async (req, accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ email: profile.emails[0].value });

//         if (!user) {
//           // Check if email belongs to a teacher
//           const teacher = await Teacher.findOne({
//             email: profile.emails[0].value,
//           });

//           let role = "student"; // default role
//           if (teacher) role = "teacher";

//           // Create new user
//           // user = new User({
//           //   email,
//           //   role,
//           //   google: {
//           //     id: profile.id,
//           //     refreshToken,
//           //   },
//           // });

//           // await user.save();
//           user = new User({
//             email: profile.emails[0].value,
//             role: "student", // default, can change later
//             google: {
//               id: profile.id,
//               refreshToken: refreshToken,
//             },
//           });
//           await user.save();

//           // Link Teacher or Student collection
//           if (teacher) {
//             teacher.userId = user._id;
//             await teacher.save();
//           } else {
//             const newStudent = new Student({ userId: user._id });
//             await newStudent.save();
//           }
//         } else if (!user.google.id) {
//           // Local user exists but hasn’t linked Google yet
//           user.google.id = profile.id;
//           user.google.refreshToken = refreshToken;
//           await user.save();
//         } else {
//           // Update refresh token if we got a new one
//           if (refreshToken) {
//             user.google.refreshToken = refreshToken;
//             await user.save();
//           }
//         }

//         return done(null, user);
//       } catch (err) {
//         console.error("Google auth error:", err);
//         return done(err, null);
//       }
//     }
//   )
// );

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          // 🔎 Check if admin
          let role = "student";
          if (email === process.env.ADMIN_EMAILS) {
            console.log("Admin user detected:", email);
            role = "admin";
          } else {
            // 🔎 Check if teacher
            const teacher = await Teacher.findOne({ email });
            if (teacher) {
              role = "teacher";
            }
          }

          // Create new user
          user = new User({
            email,
            role,
            google: {
              id: profile.id,
              refreshToken: refreshToken,
            },
          });
          await user.save();

          // 🔗 Link teacher or student record
          if (role === "teacher") {
            const teacher = await Teacher.findOne({ email });
            if (teacher) {
              teacher.userId = user._id;
              await teacher.save();
            }
          } else if (role === "student") {
            const newStudent = new Student({ userId: user._id });
            await newStudent.save();
          }
        } else {
          // Update refresh token if provided
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

// passport.serializeUser((user, done) => done(null, user.id));

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });

passport.serializeUser((user, done) => {
  done(null, user.id); // store MongoDB _id
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
