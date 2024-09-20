const express = require("express");
const cors = require("cors");
const controller = require("../controllers/ClientController");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.options("*", cors());
router.use(requireAuth);

router.get("/:clientCode", controller.getClient);
router.get("/portal/:clientCode", controller.getClientPortal);
router.get("/getOpenDays/:clientCode", controller.getOpenDays);

router.put("/updateClient/:clientCode", controller.updateClient);

module.exports = router;
