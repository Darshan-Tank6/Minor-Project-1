const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
    },
    // linkedId: mongoose.Schema.Types.ObjectId, // reference to teacher/student
  },
  { timestamps: true }
);

// Compare password method
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

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
