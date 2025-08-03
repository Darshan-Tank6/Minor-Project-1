const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    year: { type: Number, required: true },
    // college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
