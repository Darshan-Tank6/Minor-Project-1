const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    rollNumber: { type: String, required: false },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: false,
    },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    year: Number,
    email: String,
    division: String,
    currentLeaves: [
      { type: mongoose.Schema.Types.ObjectId, ref: "LeaveRequest" },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
