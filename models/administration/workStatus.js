const mongoose = require("mongoose");
const { Schema } = mongoose;

const workStatusSchema = new Schema({
  workStatusId: { type: String },
  workStatus: { type: String },
});

const collection = "workStatuses";

const LocationModel = mongoose.model(
  "WorkStatus",
  workStatusSchema,
  collection
);
module.exports = LocationModel;
