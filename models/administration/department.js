const mongoose = require("mongoose");
const { Schema } = mongoose;

const departmentSchema = new Schema({
  departmentId: { type: String },
  department: { type: String },
  isActive: { type: Boolean },
  departmentTypeId: {
    type: Schema.Types.ObjectId,
    ref: "DepartmentType",
    required: true,
  },
});

const collection = "departments";

const DepartmentModel = mongoose.model(
  "Department",
  departmentSchema,
  collection
);
module.exports = DepartmentModel;
