const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema(
//   {
//     email: { type: String, unique: true, required: true },
//     passwordHash: { type: String, required: true },
//     role: {
//       type: String,
//       enum: ["admin", "teacher", "student"],
//       required: true,
//     },
//     google: {
//       refreshToken: { type: String, required: false },
//     },
//     // linkedId: mongoose.Schema.Types.ObjectId, // reference to teacher/student
//   },
//   { timestamps: true }
// );

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },

    // For local login (can be empty if using Google)
    passwordHash: { type: String, required: false },

    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
    },

    // Google login details
    google: {
      id: { type: String }, // profile.id
      refreshToken: { type: String },
    },

    // Optionally link to Teacher/Student collections
    // linkedId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

// // Compare password method
// userSchema.methods.comparePassword = function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.passwordHash);
// };

// Password comparison only for local users
userSchema.methods.comparePassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (this.isModified("passwordHash")) {
//     const salt = await bcrypt.genSalt(10);
//     this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
//   }
//   next();
// });

// // 🔹 Generate Reset Token (For Password & PIN)
// userSchema.methods.generateResetToken = function (type) {
//   const token = crypto.randomBytes(32).toString("hex");
//   const expires = Date.now() + 3600000; // 1 hour expiry

//   if (type === "password") {
//     this.resetPasswordToken = token;
//     this.resetPasswordExpires = expires;
//   } else if (type === "pin") {
//     this.resetPinToken = token;
//     this.resetPinExpires = expires;
//   }

//   return token;
// };

module.exports = mongoose.model("User", userSchema);
