// models/MeetLink.js
const mongoose = require("mongoose");

const meetLinkSchema = new mongoose.Schema({
  studentEmail: { type: String, required: true },
  subject: { type: String, required: true },
  meetLink: { type: String, required: true },
  scheduledTime: { type: Date, required: true }, // when the meet starts
  mailed: { type: Boolean, default: false }, // track if mail sent
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MeetLink", meetLinkSchema);
