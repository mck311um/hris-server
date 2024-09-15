const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  leaveTypeId: { type: String },
  leaveType: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  isPaid: { type: Boolean, default: true },
  employeeRequested: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const collection = "leaveTypes";

const Model = mongoose.model("LeaveType", schema, collection);
module.exports = Model;
