const mongoose = require("mongoose");
const { Schema } = mongoose;

const positionSchema = new Schema({
  positionId: { type: String },
  position: { type: String, required: true },
  departmentId: {
    type: String,
    required: true,
  },
  isActive: { type: Boolean },
});

const collection = "positions";

const PositionModel = mongoose.model("Position", positionSchema, collection);
module.exports = PositionModel;
