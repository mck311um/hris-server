const express = require("express");
const cors = require("cors");

const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  getEmployees,
  addEmployee,
  updateEmployee,
  removeEmployee,
} = require("../controllers/EmployeeController");

const allowedOrigins = ["http://localhost:5173"];

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

router.get("", getEmployees);
router.post("", addEmployee);
router.put("", updateEmployee);
router.delete("", removeEmployee);

module.exports = router;
