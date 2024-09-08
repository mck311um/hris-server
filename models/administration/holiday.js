const mongoose = require("mongoose");
const { Schema } = mongoose;

const holidaySchema = new Schema({
  holidayId: { type: String },
  holiday: { type: String },
  date: { type: Date },
  observedDate: { type: Date },
  isPublic: { type: Boolean },
  isOff: { type: Boolean },
  hasPassed: { type: Boolean },
});

const collection = "holidays";

const HolidayModel = mongoose.model("Holidays", holidaySchema, collection);

module.exports = HolidayModel;
