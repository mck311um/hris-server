const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Client = require("../models/client");
const mongoose = require("mongoose");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { id, clientCode } = jwt.verify(token, process.env.JWT_SECRET);

    const client = await Client.findOne({ clientCode });

    if (!client) {
      return res.status(401).json({ error: "Invalid client code" });
    }

    const companyDb = mongoose.connection.useDb(client.dbName);

    const DynamicUserModel = companyDb.model("User", User.schema, "users");

    const user = await DynamicUserModel.findOne({ _id: id });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.clientDB = client.dbName;
    req.clientCode = client.clientCode;

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = requireAuth;
