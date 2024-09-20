const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  user: { type: String },
  action: { type: String },
  date: { type: Date },
  reason: { type: String },
});

const Model = mongoose.model("AuditLog", schema);
module.exports = Model;
