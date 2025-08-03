const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("College", collegeSchema);
