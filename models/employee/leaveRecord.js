const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    recordId: { type: String },
    employeeId: { type: String, required: true },
    days: [{ type: Date, required: true }],
    status: {
      type: Schema.Types.ObjectId,
      ref: "LeaveType",
    },
  },
  { timestamps: true }
);

const collection = "leaveRecords";

const Model = mongoose.model("LeaveRecord", schema, collection);
module.exports = Model;
