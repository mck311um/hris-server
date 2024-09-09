const mongoose = require("mongoose");
const Country = require("../models/administration/countries");
const Village = require("../models/administration/villages");
const WorkStatus = require("../models/administration/workStatus");
const EmploymentType = require("../models/administration/employmentType");
const Relationship = require("../models/administration/relationship");
const PayType = require("../models/administration/payType");

const formatDate = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getModel = (db, modelName, schemaPath) => {
  const schema = require(schemaPath).schema;
  return db.model(modelName, schema, modelName.toLowerCase() + "s");
};

//Get All
const getAdministrationData = async (req, res) => {
  const { clientDB } = req;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Position = getModel(
      companyDb,
      "Position",
      "../models/administration/position"
    );
    const Department = getModel(
      companyDb,
      "Department",
      "../models/administration/department"
    );
    const DepartmentType = getModel(
      companyDb,
      "DepartmentType",
      "../models/administration/departmentType"
    );
    const Holiday = getModel(
      companyDb,
      "Holiday",
      "../models/administration/holiday"
    );
    const Location = getModel(
      companyDb,
      "Location",
      "../models/administration/location"
    );
    const FInstitution = getModel(
      companyDb,
      "FInstitution",
      "../models/administration/fInstitution.js"
    );

    const positionsRaw = await Position.find().sort({ position: 1 });
    const departmentsRaw = await Department.find().sort({ department: 1 });
    const departmentTypesRaw = await DepartmentType.find().sort({
      departmentType: 1,
    });
    const holidaysRaw = await Holiday.find().sort({ holiday: 1 });
    const locationsRaw = await Location.find().sort({ location: 1 });
    const countriesRaw = await Country.find().sort({ country: 1 });
    const villagesRaw = await Village.find().sort({ village: 1 });
    const workStatusesRaw = await WorkStatus.find().sort({ workStatus: 1 });
    const employmentTypesRaw = await EmploymentType.find().sort({
      employmentType: 1,
    });
    const relationshipsRaw = await Relationship.find().sort({
      relationship: 1,
    });
    const payTypesRaw = await PayType.find().sort({ payType: 1 });
    const fInstitutionsRaw = await FInstitution.find().sort({
      fInstitution: 1,
    });

    const positions = positionsRaw.map((position) => ({
      positionId: position._id,
      position: position.position,
      departmentId: position.departmentId,
      isActive: position.isActive,
    }));

    const departments = departmentsRaw.map((department) => ({
      departmentId: department._id,
      department: department.department,
      isActive: department.isActive,
    }));

    const departmentTypes = departmentTypesRaw.map((departmentType) => ({
      departmentTypeId: departmentType._id,
      departmentType: departmentType.departmentType,
    }));

    const holidays = holidaysRaw.map((holiday) => ({
      holidayId: holiday._id,
      holiday: holiday.holiday,
      date: holiday.date,
      observedDate: holiday.observedDate,
      hasPassed: holiday.hasPassed,
      isPublic: holiday.isPublic,
      isOff: holiday.isOff,
    }));

    const locations = locationsRaw.map((location) => ({
      locationId: location._id,
      location: location.location,
      isActive: location.isActive,
      isMain: location.isMain,
      address: location.address,
    }));

    const countries = countriesRaw.map((country) => ({
      countryId: country._id,
      country: country.country,
      countryCode: country.countryCode,
    }));

    const villages = villagesRaw.map((village) => ({
      villageId: village._id,
      village: village.village,
      countryCode: village.countryCode,
    }));

    const workStatuses = workStatusesRaw.map((workStatus) => ({
      workStatusId: workStatus._id,
      workStatus: workStatus.workStatus,
    }));

    const employmentTypes = employmentTypesRaw.map((employmentType) => ({
      employmentTypeId: employmentType._id,
      employmentType: employmentType.employmentType,
    }));

    const relationships = relationshipsRaw.map((relationship) => ({
      relationshipId: relationship._id,
      relationship: relationship.relationship,
    }));

    const payTypes = payTypesRaw.map((payType) => ({
      payTypeId: payType._id,
      payType: payType.payType,
    }));

    const fInstitutions = fInstitutionsRaw.map((fInstitution) => ({
      fInstitutionId: fInstitution._id,
      fInstitution: fInstitution.fInstitution,
      isActive: fInstitution.isActive,
      fInstitutionCode: fInstitution.fInstitutionCode,
      fInstitutionAddress: fInstitution.fInstitutionAddress,
    }));

    res.json({
      positions,
      departments,
      departmentTypes,
      holidays,
      locations,
      countries,
      villages,
      workStatuses,
      employmentTypes,
      relationships,
      payTypes,
      fInstitutions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Positions
const getPositions = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Position = getModel(
      companyDb,
      "Position",
      "../models/administration/position"
    );

    const Department = getModel(
      companyDb,
      "Department",
      "../models/administration/department"
    );

    const positionsRaw = await Position.find().populate({
      path: "departmentId",
      model: "Department",
    });
    const positions = positionsRaw.map((position) => ({
      positionId: position._id,
      position: position.position,
      department: position.departmentId.department,
      isActive: position.isActive,
    }));
    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const addPosition = async (req, res) => {
  const { clientDB } = req;
  const { position, departmentId, isActive } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Position = getModel(
      companyDb,
      "Position",
      "../models/administration/position"
    );
    const Department = getModel(
      companyDb,
      "Department",
      "../models/administration/department"
    );

    const department = await Department.findById(departmentId);
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    const newPosition = new Position({ position, departmentId, isActive });
    await newPosition.save();
    res.json(newPosition);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
const updatePosition = async (req, res) => {
  const { clientDB } = req;
  const { positionId, position, departmentId, isActive } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Position = getModel(
      companyDb,
      "Position",
      "../models/administration/position"
    );

    const newPosition = await Position.findByIdAndUpdate(positionId, {
      position,
      departmentId,
      isActive,
    });

    res.json(newPosition);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
const removePosition = async (req, res) => {
  const { clientDB } = req;
  const { positionId } = req.params;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Position = getModel(
      companyDb,
      "Position",
      "../models/administration/position"
    );

    const position = await Position.findByIdAndDelete(positionId);
    if (!position)
      return res.status(404).json({ message: "Position not found" });
    res.json(position);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

//Departments
const getDepartments = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Department = getModel(
      companyDb,
      "Department",
      "../models/administration/department"
    );

    const DepartmentType = getModel(
      companyDb,
      "DepartmentType",
      "../models/administration/departmentType"
    );

    const departmentsRaw = await Department.find().populate({
      path: "departmentTypeId",
      model: "DepartmentType",
    });
    const departments = departmentsRaw.map((department) => ({
      departmentId: department._id,
      department: department.department,
      isActive: department.isActive,
      departmentType: department.departmentTypeId.departmentType,
    }));
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const addDepartment = async (req, res) => {
  const { clientDB } = req;

  const { department, isActive, departmentTypeId } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Department = getModel(
      companyDb,
      "Department",
      "../models/administration/department"
    );

    const newDepartment = new Department({
      department,
      isActive,
      departmentTypeId,
    });
    await newDepartment.save();
    res.json(newDepartment);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
const updateDepartment = async (req, res) => {
  const { clientDB } = req;
  const { departmentId, department, isActive, departmentTypeId } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Department = getModel(
      companyDb,
      "Department",
      "../models/administration/department"
    );

    const updatedDepartment = await Department.findByIdAndUpdate(
      departmentId,
      { department, isActive, departmentTypeId },
      { new: true }
    );
    res.json(updatedDepartment);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
const removeDepartment = async (req, res) => {
  const { clientDB } = req;
  const { departmentId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Department = getModel(
      companyDb,
      "Department",
      "../models/administration/department"
    );

    const department = await Department.findByIdAndDelete(departmentId);
    if (!department)
      return res.status(404).json({ message: "Department not found" });
    res.json(department);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

//Holidays
const getHolidays = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Holiday = getModel(
      companyDb,
      "Holiday",
      "../models/administration/holiday"
    );
    const holidaysRaw = await Holiday.find();
    const now = new Date();

    const holidays = holidaysRaw.map((holiday) => {
      const holidayDate = new Date(holiday.date);
      const hasPassed = holidayDate < now;

      return {
        holidayId: holiday._id,
        holiday: holiday.holiday,
        date: formatDate(holidayDate),
        observedDate: formatDate(new Date(holiday.observedDate)),
        hasPassed: hasPassed,
        isPublic: holiday.isPublic,
        isOff: holiday.isOff,
      };
    });

    await Promise.all(
      holidaysRaw.map(async (holiday, index) => {
        const holidayDate = new Date(holiday.date);
        const hasPassed = holidayDate < now;

        if (holiday.hasPassed !== hasPassed) {
          await Holiday.findByIdAndUpdate(holiday._id, {
            hasPassed: hasPassed,
          });
        }
      })
    );

    res.json(holidays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const addHoliday = async (req, res) => {
  const { clientDB } = req;

  const { holiday, date, observedDate, hasPassed, isPublic, isOff } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Holiday = getModel(
      companyDb,
      "Holiday",
      "../models/administration/holiday"
    );
    const newHoliday = new Holiday({
      holiday,
      date,
      observedDate,
      hasPassed,
      isPublic,
      isOff,
    });
    await newHoliday.save();
    res.json(newHoliday);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
const updateHoliday = async (req, res) => {
  const { clientDB } = req;

  const { holidayId, holiday, date, observedDate, hasPassed, isPublic, isOff } =
    req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Holiday = getModel(
      companyDb,
      "Holiday",
      "../models/administration/holiday"
    );

    const updatedHoliday = await Holiday.findByIdAndUpdate(
      holidayId,
      { holiday, date, observedDate, hasPassed, isPublic, isOff },
      { new: true }
    );
    res.json(updatedHoliday);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
const removeHoliday = async (req, res) => {
  const { clientDB } = req;

  const { holidayId } = req.params;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Holiday = getModel(
      companyDb,
      "Holiday",
      "../models/administration/holiday"
    );

    const holiday = await Holiday.findByIdAndDelete(holidayId);
    if (!holiday) return res.status(404).json({ message: "Holiday not found" });
    res.json(holiday);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

//Locations
const getLocations = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Location = getModel(
      companyDb,
      "Location",
      "../models/administration/location"
    );

    const locationsRaw = await Location.find();
    const locations = locationsRaw.map((location) => ({
      locationId: location._id,
      location: location.location,
      isActive: location.isActive,
      isMain: location.isMain,
      address: location.address,
    }));
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const addLocation = async (req, res) => {
  const { clientDB } = req;

  const { location, isActive, isMain, address } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Location = getModel(
      companyDb,
      "Location",
      "../models/administration/location"
    );

    const newLocation = new Location({ location, isActive, isMain, address });
    await newLocation.save();
    res.json(newLocation);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
const updateLocation = async (req, res) => {
  const { clientDB } = req;

  const { locationId, location, isActive, isMain, address } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Location = getModel(
      companyDb,
      "Location",
      "../models/administration/location"
    );

    const updatedLocation = await Location.findByIdAndUpdate(
      locationId,
      { location, isActive, isMain, address },
      { new: true }
    );
    res.json(updatedLocation);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
const removeLocation = async (req, res) => {
  const { clientDB } = req;

  const { locationId } = req.params;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Location = getModel(
      companyDb,
      "Location",
      "../models/administration/location"
    );

    const location = await Location.findByIdAndDelete(locationId);
    if (!location)
      return res.status(404).json({ message: "Location not found" });
    res.json(location);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

//FInstitutions
const getFInstitutions = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const FInstitution = getModel(
      companyDb,
      "FInstitution",
      "../models/administration/fInstitution.js"
    );
    const fInstitutionsRaw = await FInstitution.find();
    const fInstitutions = fInstitutionsRaw.map((fInstitution) => ({
      fInstitutionId: fInstitution._id,
      fInstitution: fInstitution.fInstitution,
      isActive: fInstitution.isActive,
      fInstitutionCode: fInstitution.fInstitutionCode,
      fInstitutionAddress: fInstitution.fInstitutionAddress,
    }));
    res.json(fInstitutions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const addFInstitution = async (req, res) => {
  const { clientDB } = req;
  const {
    fInstitution,
    fInstitutionCode,
    fInstitutionAddress,
    isActive,
    isCreditor,
  } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const FInstitution = getModel(
      companyDb,
      "FInstitution",
      "../models/administration/fInstitution.js"
    );
    const newFInstitution = new FInstitution({
      fInstitution,
      fInstitutionCode,
      fInstitutionAddress,
      isActive,
      isCreditor,
    });
    await newFInstitution.save();
    res.json(newFInstitution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const updateFInstitution = async (req, res) => {
  const { clientDB } = req;
  const {
    fInstitutionId,
    fInstitution,
    fInstitutionCode,
    fInstitutionAddress,
    isActive,
    isCreditor,
  } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const FInstitution = getModel(
      companyDb,
      "FInstitution",
      "../models/administration/fInstitution.js"
    );
    const updatedFInstitution = await FInstitution.findByIdAndUpdate(
      fInstitutionId,
      {
        fInstitution,
        fInstitutionCode,
        fInstitutionAddress,
        isActive,
        isCreditor,
      },
      { new: true }
    );
    res.json(updatedFInstitution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const removeFInstitution = async (req, res) => {
  const { clientDB } = req;
  const { fInstitutionId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const FInstitution = getModel(
      companyDb,
      "FInstitution",
      "../models/administration/fInstitution.js"
    );
    const fInstitution = await FInstitution.findByIdAndDelete(fInstitutionId);
    if (!fInstitution) {
      return res
        .status(404)
        .json({ message: "Financial Institution not found" });
    }
    res.json(fInstitution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAdministrationData,
  getPositions,
  addPosition,
  removePosition,
  updatePosition,
  getDepartments,
  addDepartment,
  removeDepartment,
  updateDepartment,
  getHolidays,
  addHoliday,
  removeHoliday,
  updateHoliday,
  getLocations,
  addLocation,
  removeLocation,
  updateLocation,
  getFInstitutions,
  addFInstitution,
  removeFInstitution,
  updateFInstitution,
};
