const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  userName: { type: String, required: true },
  name: { type: String },
  password: { type: String, required: true },
  requirePasswordChange: { type: Boolean },
});

collectionName = "users";

const UserModel = mongoose.model("User", userSchema, collectionName);
module.exports = UserModel;
