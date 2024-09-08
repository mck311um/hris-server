const Position = require("../models/position");
const Department = require("../models/department");
const DepartmentType = require("../models/departmentType");

//Get All
const getAdministrationData = async (req, res) => {
  try {
    const positionsRaw = await Position.find();
    const departmentsRaw = await Department.find();
    const departmentTypesRaw = await DepartmentType.find();

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

    res.json({ positions, departments, departmentTypes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Positions
const getPositions = async (req, res) => {
  try {
    const positionsRaw = await Position.find();
    const positions = positionsRaw.map((position) => ({
      positionId: position.positionId,
      position: position.position,
      department: position.department,
      isActive: position.isActive,
    }));
    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const addPosition = async (req, res) => {};
const removePosition = async (req, res) => {};
const updatePosition = async (req, res) => {};

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
  const { department, isActive } = req.body;

  try {
    const newDepartment = new Department({ department, isActive });
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
};
