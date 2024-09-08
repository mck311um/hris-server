const Position = require("../models/administration/position");
const Department = require("../models/administration/department");
const DepartmentType = require("../models/administration/departmentType");
const Holiday = require("../models/administration/holiday");

const formatDate = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

//Get All
const getAdministrationData = async (req, res) => {
  try {
    const positionsRaw = await Position.find();
    const departmentsRaw = await Department.find();
    const departmentTypesRaw = await DepartmentType.find();
    const holidaysRaw = await Holiday.find();

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

    res.json({ positions, departments, departmentTypes, holidays });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Positions
const getPositions = async (req, res) => {
  try {
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
  const { position, departmentId, isActive } = req.body;

  try {
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
  const { positionId, position, departmentId, isActive } = req.body;

  try {
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
const removePosition = async (req, res) => {};

//Departments
const getDepartments = async (req, res) => {
  try {
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
  console.log(req.body);
  const { department, isActive, departmentTypeId } = req.body;

  try {
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
const removeDepartment = async (req, res) => {};
const updateDepartment = async (req, res) => {
  const { departmentId, department, isActive, departmentTypeId } = req.body;

  try {
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

//Holidays
const getHolidays = async (req, res) => {
  try {
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
  const { holiday, date, observedDate, hasPassed, isPublic, isOff } = req.body;

  try {
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
  const { holidayId, holiday, date, observedDate, hasPassed, isPublic, isOff } =
    req.body;

  try {
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
const removeHoliday = async (req, res) => {};

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
};
