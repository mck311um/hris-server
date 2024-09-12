const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  allowanceId: { type: String },
  allowance: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const collection = "allowances";

const Model = mongoose.model("Allowance", schema, collection);
module.exports = Model;
