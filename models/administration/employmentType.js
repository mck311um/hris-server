const mongoose = require("mongoose");
const { Schema } = mongoose;

const employmentTypeSchema = new Schema({
  employmentTypeId: { type: String },
  employmentType: { type: String },
});

const collection = "employmentTypes";

const EmploymentTypeModel = mongoose.model(
  "EmploymentType",
  employmentTypeSchema,
  collection
);

module.exports = EmploymentTypeModel;
