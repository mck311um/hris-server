const express = require("express");
const cors = require("cors");
const { login, addUser } = require("../controllers/AuthController");
const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];

router.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS. Origin: ${origin}`);
        callback(
          new Error("CORS policy does not allow access from this origin.")
        );
      }
    },
  })
);

router.options("*", cors());

router.post("/login", login);
router.post("/register", addUser);

module.exports = router;
