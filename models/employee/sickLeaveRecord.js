const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  recordId: { type: "string" },
  employeeId: { type: "string", required: true },
  fullName: { type: "string" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: "number" },
  illness: { type: "string", required: false },
  notes: { type: "string", required: false },
  isPaid: { type: "boolean" },
  isDeleted: { type: "boolean", default: false },
  paidDays: { type: "number", default: 0 },
  systemComment: { type: "string", required: false },
  benefits: { type: "number" },
});

const collection = "sickLeaveRecords";

const Model = mongoose.model("SickLeaveRecord", schema, collection);
module.exports = Model;
