const mongoose = require("mongoose");
const { Schema } = mongoose;

const locationSchema = new Schema({
  locationId: { type: String },
  location: { type: String },
  isActive: { type: Boolean },
  isMain: { type: Boolean },
});

const collection = "locations";

const LocationModel = mongoose.model("Locations", locationSchema, collection);
module.exports = LocationModel;
