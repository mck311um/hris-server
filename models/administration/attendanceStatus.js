const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  statusId: { type: String },
  status: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  isPaid: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const collection = "attendanceStatues";

const Model = mongoose.model("AttendanceStatus", schema, collection);
module.exports = Model;
