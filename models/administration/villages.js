const mongoose = require("mongoose");
const { Schema } = mongoose;

const villageSchema = new Schema({
  villageId: { type: String },
  village: { type: String },
  countryCode: { type: String },
});

const collection = "villages";

const VillageModel = mongoose.model("Village", villageSchema, collection);
module.exports = VillageModel;
