const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  leaveTypeId: {
    type: Schema.Types.ObjectId,
    ref: "LeaveType",
    default: null,
  },
  notes: { type: String },
  days: [{ type: String }],
  employeeId: { type: String },
  status: { type: String, default: "Pending" },
  actionedBy: { type: String },
  dateMade: { type: Date, default: new Date() },
});

const collection = "timeOffRequests";

const Model = mongoose.model("TimeOfRequest", schema, collection);
module.exports = Model;
