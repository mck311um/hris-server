const mongoose = require("mongoose");
const { Schema } = mongoose;

const countrySchema = new Schema({
  countryId: { type: String },
  country: { type: String },
  countryCode: { type: String },
});

const collection = "countries";

const CountryModel = mongoose.model("Country", countrySchema, collection);
module.exports = CountryModel;
