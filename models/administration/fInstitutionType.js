const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  fInstitutionTypeId: { type: String },
  fInstitutionType: { type: String },
  description: { type: String },
});

const collection = "fInstitutionTypes";

const Model = mongoose.model("Allowance", schema, collection);
module.exports = Model;
