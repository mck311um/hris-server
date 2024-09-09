const express = require("express");
const cors = require("cors");
const {
  getPositions,
  addPosition,
  updatePosition,
  removePosition,
  getDepartments,
  addDepartment,
  updateDepartment,
  removeDepartment,
  getAdministrationData,
  getHolidays,
  addHoliday,
  updateHoliday,
  removeHoliday,
  getLocations,
  addLocation,
  updateLocation,
  removeLocation,
} = require("../controllers/AdministrationController");
const router = express.Router();

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

//Fetch
router.get("", getAdministrationData);
router.get("/positions", getPositions);
router.get("/departments", getDepartments);
router.get("/holidays", getHolidays);
router.get("/locations", getLocations);

//Create
router.post("/position", addPosition);
router.post("/department", addDepartment);
router.post("/holiday", addHoliday);
router.post("/location", addLocation);

//Update
router.put("/position", updatePosition);
router.put("/department", updateDepartment);
router.put("/holiday", updateHoliday);
router.put("/location", updateLocation);

//Delete
router.delete("/position/:positionId", removePosition);
router.delete("/department/:departmentId", removeDepartment);
router.delete("/holiday/:holidayId", removeHoliday);
router.delete("/location/:locationId", removeLocation);

module.exports = router;
