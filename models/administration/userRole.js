const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  userRoleId: { type: String },
  userRole: { type: String, required: true },
  description: { type: String },
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const collection = "userRoles";

const Model = mongoose.model("UserRoles", schema, collection);
module.exports = Model;
