const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    recordId: { type: String },
    employeeId: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceStatus",
      default: null,
    },
    updatedBy: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const collection = "attendanceRecord";

const Model = mongoose.model("AttendanceRecord", schema, collection);
module.exports = Model;
