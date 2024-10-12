const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    scheduleId: { type: String },
    scheduleName: { type: String, required: true },
    frequency: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    monthlyDay: { type: Number },
    fortnightlyStartDate: { type: Date },
    weeklyPayDay: { type: String },
  },
  { timestamps: true }
);

const Model = mongoose.model("PayrollSchedule", schema);
module.exports = Model;
