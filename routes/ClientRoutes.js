const express = require("express");
const cors = require("cors");
const controller = require("../controllers/ClientController");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

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
router.use(requireAuth);

router.get("/getClient/:clientCode", controller.getClient);
router.put("/updateClient/:clientCode", controller.updateClient);

module.exports = router;
