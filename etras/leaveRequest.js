const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
  {
    approved: Boolean,
    approvedAt: Date,
    comments: String,
  },
  { _id: false }
);

const leaveRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvals: {
      classTeacher: approvalSchema,
      hod: approvalSchema,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
