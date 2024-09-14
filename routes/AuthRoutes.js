const express = require("express");
const cors = require("cors");
const { login, addUser } = require("../controllers/AuthController");
const router = express.Router();

const allowedOrigins = [
  "http://localhost:5173",
  "https://hris.devvize.com",
  "https://devhris.vercel.app",
];

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.options("*", cors());

router.post("/login", login);
router.post("/register", addUser);

module.exports = router;
