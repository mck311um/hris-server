const express = require("express");
const cors = require("cors");

const controller = require("../controllers/AdministrationController");
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

//Fetch
router.get("", controller.getAdministrationData);
router.get("/positions", controller.getPositions);
router.get("/departments", controller.getDepartments);
router.get("/holidays", controller.getHolidays);
router.get("/locations", controller.getLocations);
router.get("/fInstitutions", controller.getFInstitutions);
router.get("/allowances", controller.getAllowances);
router.get("/deductions", controller.getDeductions);
router.get("/userRoles", controller.getUserRoles);
router.get("/permissions", controller.getPermissions);
router.get("/userRole/permissions/:userRoleId", controller.getRolePermissions);
router.get("/attendanceStatuses", controller.getAttendanceStatuses);
router.get("/leaveTypes", controller.getLeaveTypes);

//Create
router.post("/position", controller.addPosition);
router.post("/department", controller.addDepartment);
router.post("/holiday", controller.addHoliday);
router.post("/location", controller.addLocation);
router.post("/fInstitution", controller.addFInstitution);
router.post("/allowance", controller.addAllowance);
router.post("/deduction", controller.addDeduction);
router.post("/userRole", controller.addUserRole);
router.post("/userRole/addPermission", controller.addPermissionToRole);
router.post("/attendanceStatus", controller.addAttendanceStatus);
router.post("/leaveType", controller.addLeaveType);

//Update
router.put("/position", controller.updatePosition);
router.put("/department", controller.updateDepartment);
router.put("/holiday", controller.updateHoliday);
router.put("/location", controller.updateLocation);
router.put("/fInstitution", controller.updateFInstitution);
router.put("/allowance", controller.updateAllowance);
router.put("/deduction", controller.updateDeduction);
router.put("/userRole", controller.updateUserRole);
router.put("/attendanceStatus", controller.updateAttendanceStatus);
router.put("/leaveType", controller.updateLeaveType);

//Delete
router.delete("/position/:positionId", controller.removePosition);
router.delete("/department/:departmentId", controller.removeDepartment);
router.delete("/holiday/:holidayId", controller.removeHoliday);
router.delete("/location/:locationId", controller.removeLocation);
router.delete("/fInstitution/:fInstitutionId", controller.removeFInstitution);
router.delete("/allowance/:allowanceId", controller.removeAllowance);
router.delete("/deduction/:deductionId", controller.removeDeduction);
router.delete("/userRole/:userRoleId", controller.removeUserRole);
router.delete(
  "/userRole/removePermission/:userRoleId/:permissionId",
  controller.removePermissionFromRole
);
router.delete("/attendanceStatus", controller.removeAttendanceStatus);
router.delete("/leaveType/:leaveTypeId", controller.removeLeaveType);

module.exports = router;
