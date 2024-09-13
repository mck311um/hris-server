const mongoose = require("mongoose");
const { Schema } = mongoose;

const clientSchema = new Schema({
  client: { type: "string" },
  clientCode: { type: String, required: true, unique: true },
  dbName: { type: String, required: true },
  paymentStatus: { type: String, default: "active" },
  clientLocation: { type: String },
  openDays: [{ type: String }],
  address: { type: String },
  contactPerson: { type: String },
  contactNumber: { type: String },
  email: { type: String },
});

const collection = "clients";

const ClientModel = mongoose.model("Client", clientSchema, collection);

module.exports = ClientModel;
