const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    year: Number,
    email: String,
    currentLeaves: [
      { type: mongoose.Schema.Types.ObjectId, ref: "LeaveRequest" },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
