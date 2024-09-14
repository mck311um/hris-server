const express = require("express");
const cors = require("cors");

const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const controller = require("../controllers/EmployeeController");

const allowedOrigins = [
  "http://localhost:5173",
  "https://hris.devvize.com",
  "https://devhris.vercel.app/",
];
router.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

router.options("*", cors());
router.use(requireAuth);

router.get("", controller.getEmployees);
router.get("/attendanceRecords", controller.getAttendanceRecords);

router.post("", controller.addEmployee);
router.post("/bulk", controller.addEmployee);
router.post(
  "/attendanceRecordByEmpId",
  controller.getAttendanceRecordsByEmployeeId
);

router.put("", controller.updateEmployee);
router.put("/attendanceRecord", controller.updateAttendanceRecord);
router.put("/attendanceRecords", controller.updateAllEmployeesAttendanceRecord);

router.delete("", controller.removeEmployee);

module.exports = router;
