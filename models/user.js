const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  userName: { type: String, required: true },
  roleId: { type: Schema.Types.ObjectId, ref: "UserRole", default: null },
  employeeId: { type: String, required: true },
  password: { type: String, required: true },
  requirePasswordChange: { type: Boolean },
});

collectionName = "users";

const UserModel = mongoose.model("User", userSchema, collectionName);
module.exports = UserModel;
