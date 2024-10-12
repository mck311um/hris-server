const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    allowanceId: { type: String },
    allowance: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const collection = "allowances";

const Model = mongoose.model("EmployeeAllowance", schema, collection);
module.exports = Model;
