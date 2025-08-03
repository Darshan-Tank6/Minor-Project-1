const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "class_teacher",
        "teaching_professor",
        "assistant_professor",
        "unassigned",
      ],
      default: "unassigned",
      required: true,
    },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    assignedSubjects: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: [] },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
