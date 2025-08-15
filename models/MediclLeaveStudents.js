const mongoose = require("mongoose");

const medicalLeaveStudentsSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    From_date: { type: Date, default: Date.now },
    To_date: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    rejectionReason: { type: String, default: "" },
    noDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "MedicalLeaveStudents",
  medicalLeaveStudentsSchema
);
