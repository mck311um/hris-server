const express = require("express");
const cors = require("cors");

const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const controller = require("../controllers/PayrollController");

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.options("*", cors());
router.use(requireAuth);

//Get
router.get("/details/:employeeId", controller.getEmployeePayDetails);
router.get("/schedule", controller.getPayrollSchedules);
router.get(
  "/records/allowance/:employeeId",
  controller.getAllowancesByEmployeeId
);

//Post
router.post("/records/allowance", controller.addAllowanceRecord);
router.post("/schedule", controller.createPayrollSchedule);

module.exports = router;
