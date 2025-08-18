const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    student_email: String,
    roll_no: String,
    department: String,
    reason: String,
    from_date: String,
    to_date: String,
    teacher_emails: [String],
    approved_by: [String],
    thread_id: String,
    status: { type: String, default: "pending" },
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
