const mongoose = require("mongoose");
const { Schema } = mongoose;

const fInstitutionSchema = new Schema({
  fInstitutionId: { type: String },
  fInstitution: { type: String },
  fInstitutionCode: { type: String },
  fInstitutionAddress: { type: String },
  isActive: { type: Boolean },
  isCreditor: { type: Boolean },
});

const collection = "financialInstitutions";

const FInstitutionModel = mongoose.model(
  "FInstitution",
  fInstitutionSchema,
  collection
);
module.exports = FInstitutionModel;
