const mongoose = require("mongoose");
const { create } = require("./leaveRecord");
const { Schema } = mongoose;

const schema = new Schema(
  {
    transactionId: { type: String },
    employeeId: { type: String, required: true },
    value: { type: Number, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

const collection = "vacationTransactions";

const Model = mongoose.model("VacationTransaction", schema, collection);
module.exports = Model;
