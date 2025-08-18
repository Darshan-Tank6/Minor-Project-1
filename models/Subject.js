const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    number: Number,
    title: String,
    topics: [String],
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    startTime: String,
    endTime: String,
    room: String,
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    type: { type: String, enum: ["theory", "lab"], required: true },
    teachingProfId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    assistantProfId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    schedule: [scheduleSchema],
    chapters: [chapterSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
