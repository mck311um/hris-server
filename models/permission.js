const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  permissionId: { type: String },
  permission: { type: String, required: true },
  permissionType: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const collection = "permissions";

const Model = mongoose.model("Permission", schema, collection);
module.exports = Model;
