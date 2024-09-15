const mongoose = require("mongoose");
const Client = require("../models/client/client");
const User = require("../models/user");
const Permission = require("../models/permission");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const getModel = (db, modelName, schemaPath) => {
  const schema = require(schemaPath).schema;
  return db.model(modelName, schema, modelName.toLowerCase() + "s");
};

const addUser = async (req, res) => {
  const { clientCode, username, password } = req.body;

  try {
    const client = await Client.findOne({ clientCode });

    if (!client) {
      return res.status(400).json({ message: "Invalid Client Code" });
    }

    if (client.paymentStatus !== "active") {
      return res
        .status(403)
        .json({ message: "Payment issues. Contact support." });
    }

    const companyDb = mongoose.connection.useDb(client.dbName);
    const DynamicUserModel = companyDb.model("User", User.schema, "users");

    const existingUser = await DynamicUserModel.findOne({ userName: username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new DynamicUserModel({
      userName: username.toLowerCase(),
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { clientCode, username, password } = req.body;

  try {
    const client = await Client.findOne({ clientCode });

    if (!client) {
      return res.status(400).json({ message: "Invalid company code" });
    }

    if (client.paymentStatus !== "active") {
      return res
        .status(403)
        .json({ message: "Payment issues. Contact support." });
    }

    const companyDb = mongoose.connection.useDb(client.dbName);
    const DynamicUserModel = companyDb.model("User", User.schema, "users");
    const UserRole = getModel(
      companyDb,
      "UserRole",
      "../models/administration/userRole"
    );

    const user = await DynamicUserModel.findOne({
      userName: username.toLowerCase(),
    }).populate({
      path: "roleId",
      populate: {
        path: "permissions",
        model: "Permission",
        select: "permission _id",
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user._id, clientCode: client.clientCode },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const permissions = user.roleId.permissions.map((permission) => ({
      permissionId: permission._id,
      permission: permission.permission,
    }));

    const userData = {
      employeeId: user.employeeId,
      userId: user._id,
      username: user.userName,
      userRole: user.roleId.userRole,
      permissions: permissions,
      clientCode: client.clientCode,
      clientLocation: client.clientLocation,
      client: client.client,
      token,
      activeTime: new Date().toISOString(),
    };

    return res.json(userData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  addUser,
  login,
};
