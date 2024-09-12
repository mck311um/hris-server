const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  deductionId: { type: String },
  deduction: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const collection = "deductions";

const Model = mongoose.model("Deductions", schema, collection);
module.exports = Model;
