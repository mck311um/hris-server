const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  recordId: { type: String },
  employeeId: { type: String, required: true },
  date: { type: Date, required: true },
  status: {
    type: Schema.Types.ObjectId,
    ref: "AttendanceStatus",
    default: null,
  },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
  updatedBy: { type: String },
  notes: { type: String },
});

const collection = "attendanceRecord";

const Model = mongoose.model("AttendanceRecord", schema, collection);
module.exports = Model;
