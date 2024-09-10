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
  getFInstitutions,
  addFInstitution,
  updateFInstitution,
  removeFInstitution,
} = require("../controllers/AdministrationController");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

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

//Fetch
router.get("", getAdministrationData);
router.get("/positions", getPositions);
router.get("/departments", getDepartments);
router.get("/holidays", getHolidays);
router.get("/locations", getLocations);
router.get("/fInstitutions", getFInstitutions);

//Create
router.post("/position", addPosition);
router.post("/department", addDepartment);
router.post("/holiday", addHoliday);
router.post("/location", addLocation);
router.post("/fInstitution", addFInstitution);

//Update
router.put("/position", updatePosition);
router.put("/department", updateDepartment);
router.put("/holiday", updateHoliday);
router.put("/location", updateLocation);
router.put("/fInstitution", updateFInstitution);

//Delete
router.delete("/position/:positionId", removePosition);
router.delete("/department/:departmentId", removeDepartment);
router.delete("/holiday/:holidayId", removeHoliday);
router.delete("/location/:locationId", removeLocation);
router.delete("/fInstitution/:fInstitutionId", removeFInstitution);

module.exports = router;
