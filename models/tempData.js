const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  activeTime: { type: "string" },
  clientCode: { type: "string" },
  employeeId: { type: "string" },
  permissions: [
    {
      permissionId: { type: "string" },
      permission: { type: "string" },
    },
  ],
  portal: { type: "string" },
  token: { type: "string" },
  username: { type: "string" },
  userRole: { type: "string" },
});

const collection = "tempData";

const Model = mongoose.model("TempData", schema, collection);
module.exports = Model;
