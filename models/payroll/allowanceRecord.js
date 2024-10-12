const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    employeeId: { type: String, required: true },
    allowanceId: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeAllowance",
      default: null,
    },
    amount: { type: Number, default: 0.0, required: true },
    effectiveDate: { type: Date, required: true },
    frequency: { type: String, required: true },
    endDate: { type: Date },
    notes: { type: String },
    numberOfPayrolls: { type: Number },
  },
  { timestamps: true }
);

const collection = "allowanceRecords";

const Model = mongoose.model("AllowanceRecord", schema, collection);
module.exports = Model;
