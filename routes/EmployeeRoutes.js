const express = require("express");
const cors = require("cors");

const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const controller = require("../controllers/EmployeeController");

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.options("*", cors());
router.use(requireAuth);

router.get("", controller.getEmployees);
router.get("/attendanceRecords", controller.getAttendanceRecords);
router.get("/:employeeId", controller.getEmployeeDetailsByEmployeeId);
router.get(
  "/timeOffRequests/:employeeId",
  controller.getTimeOffRequestsByEmployeeId
);
router.get("/records/sickLeave", controller.getSickLeaveRecords);
router.get("/records/sickLeave/:recordId", controller.getSickLeaveData);
router.get("/probation/getEmployees", controller.getEmployeesOnProbation);

router.post("", controller.addEmployee);
router.post("/bulk", controller.addEmployee);
router.post("/attendanceRecordByDate", controller.getAttendanceRecordsByDate);
router.post("/timeOffRequest", controller.addTimeOffRequest);
router.post("/records/sickLeave", controller.addSickLeaveRecord);
router.post("/probation/updateEmployee", controller.updateEmployeeProbation);
router.post("/actionTimeOffRequest", controller.actionTimeOffRequest);

router.put("", controller.updateEmployee);
router.put("/attendanceRecord", controller.updateAttendanceRecord);
router.put("/attendanceRecords", controller.updateAllEmployeesAttendanceRecord);
router.put("/records/sickLeave", controller.updateSickLeaveRecord);

router.delete("", controller.removeEmployee);

module.exports = router;
