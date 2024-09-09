const mongoose = require("mongoose");
const { Schema } = mongoose;

const payTypeSchema = new Schema({
  payTypeId: { type: String },
  payType: { type: String },
});

const collection = "payTypes";

const PayTypeModel = mongoose.model("PayType", payTypeSchema, collection);
module.exports = PayTypeModel;
