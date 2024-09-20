const express = require("express");
const cors = require("cors");
const {
  login,
  addUser,
  transferData,
  getTransferredData,
} = require("../controllers/AuthController");
const router = express.Router();

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.options("*", cors());

router.post("/login", login);
router.post("/register", addUser);
router.post("/transferData", transferData);
router.post("/getTransferredData", getTransferredData);

module.exports = router;
