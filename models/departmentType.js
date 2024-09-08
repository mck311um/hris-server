const mongoose = require("mongoose");
const { Schema } = mongoose;

const departmentTypeSchema = new Schema({
  departmentTypeId: { type: String },
  departmentType: { type: String },
  isActive: { type: Boolean },
});

const collection = "departmentTypes";

const DepartmentTypeModel = mongoose.model(
  "DepartmentType",
  departmentTypeSchema,
  collection
);
module.exports = DepartmentTypeModel;
