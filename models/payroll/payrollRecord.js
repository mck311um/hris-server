const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    payrollId: { type: "string" },
    payrollScheduleId: {
      type: Schema.Types.ObjectId,
      ref: "PayrollSchedule",
      default: null,
    },
    payrollStartDate: { type: Date, default: null },
    payrollEndDate: { type: Date, default: null },
    payDate: { type: Date, default: null },
    payrollAmount: { type: "number", default: 0.0 },
    payrollNumber: { type: "number", default: 0 },
    isPaid: { type: "boolean", default: false },
    payrollFileLocation: { type: "string", default: "" },
  },
  { timestamps: true }
);

const collection = "payrollRecords";

const Model = mongoose.model("PayrollRecord", schema, collection);
module.exports = Model;
