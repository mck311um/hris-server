const mongoose = require("mongoose");
const { Schema } = mongoose;

const employeeSchema = new Schema({
  employeeId: { type: String, unique: true },
  title: { type: String, default: "" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String, default: "" },
  gender: { type: String, default: "" },
  maritalStatus: { type: String, default: "" },
  countryOfBirth: { type: String, default: "" },
  dateOfBirth: { type: Date, default: Date.now },
  age: { type: Number, default: 0 },
  socialSecurityNumber: { type: String, unique: true, default: "" },
  mobileNumber: { type: String, default: "" },
  homeNumber: { type: String, default: "" },
  email: { type: String, default: "" },
  addressLine1: { type: String, default: "" },
  addressLine2: { type: String, default: "" },
  parish: { type: String, default: "" },
  village: { type: String, default: "" },
  emergencyContact1Name: { type: String, default: "" },
  emergencyContact1Number: { type: String, default: "" },
  emergencyContact1Relationship: { type: String, default: "" },
  emergencyContact1AddressLine1: { type: String, default: "" },
  emergencyContact1AddressLine2: { type: String, default: "" },
  emergencyContact1Parish: { type: String, default: "" },
  emergencyContact1Village: { type: String, default: "" },
  emergencyContact2Name: { type: String, default: "" },
  emergencyContact2Number: { type: String, default: "" },
  emergencyContact2Relationship: { type: String, default: "" },
  emergencyContact2AddressLine1: { type: String, default: "" },
  emergencyContact2AddressLine2: { type: String, default: "" },
  emergencyContact2Parish: { type: String, default: "" },
  emergencyContact2Village: { type: String, default: "" },
  positionId: { type: Schema.Types.ObjectId, ref: "Position", default: null },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    default: null,
  },
  reportsTo: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
  assignedLocationId: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    default: null,
  },
  hireDate: { type: Date, default: Date.now },
  terminationDate: { type: Date, default: null },
  isFinite: { type: Boolean, default: true },
  employmentTypeId: {
    type: Schema.Types.ObjectId,
    ref: "EmploymentType",
    default: null,
  },
  workStatusId: {
    type: Schema.Types.ObjectId,
    ref: "WorkStatus",
    default: null,
  },
  salary: { type: Number, default: 0 },
  payType: { type: String, default: "" },
  payRate: { type: Number, default: 0.0 },
  accountNumber: { type: String, default: "" },
  institutionId: {
    type: Schema.Types.ObjectId,
    ref: "FInstitution",
    default: null,
  },
});

const collection = "employees";

const EmployeeModel = mongoose.model("Employee", employeeSchema, collection);
module.exports = EmployeeModel;
