const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    payrollId: { type: "string" },
    employeeId: { type: "string" },
    payType: { type: "string", default: "REG" },
    payAmount: { type: "number", default: 0 },
    isPaid: { type: "boolean", default: false },
    referenceId: { type: "string" },
    payDate: { type: "date" },
  },
  { timestamps: true }
);

const collection = "employeePayRecords";

const Model = mongoose.model("EmployeePayRecord", schema, collection);
module.exports = Model;
