const mongoose = require("mongoose");
const Permission = require("../models/permission");
const FInstitutionType = require("../models/administration/fInstitutionType");
const Sentry = require("@sentry/node");

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

const fetchAndTransformData = async (
  companyDb,
  modelName,
  modelPath,
  transformFn
) => {
  const Model = getModel(companyDb, modelName, modelPath);
  const rawData = await Model.find().sort({ [modelName]: 1 });
  return rawData.map(transformFn);
};

//Get All
const getAdministrationData = async (req, res) => {
  const { clientDB } = req;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const data = await Promise.all([
      fetchAndTransformData(
        companyDb,
        "Position",
        "../models/administration/position",
        (position) => ({
          positionId: position._id,
          position: position.position,
          departmentId: position.departmentId,
          isActive: position.isActive,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "Department",
        "../models/administration/department",
        (department) => ({
          departmentId: department._id,
          department: department.department,
          isActive: department.isActive,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "DepartmentType",
        "../models/administration/departmentType",
        (departmentType) => ({
          departmentTypeId: departmentType._id,
          departmentType: departmentType.departmentType,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "Holiday",
        "../models/administration/holiday",
        (holiday) => ({
          holidayId: holiday._id,
          holiday: holiday.holiday,
          date: holiday.date,
          observedDate: holiday.observedDate,
          hasPassed: holiday.hasPassed,
          isPublic: holiday.isPublic,
          isOff: holiday.isOff,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "Location",
        "../models/administration/location",
        (location) => ({
          locationId: location._id,
          location: location.location,
          isActive: location.isActive,
          isMain: location.isMain,
          address: location.address,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "Country",
        "../models/administration/country",
        (country) => ({
          countryId: country._id,
          country: country.country,
          countryCode: country.countryCode,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "Village",
        "../models/administration/village",
        (village) => ({
          villageId: village._id,
          village: village.village,
          countryCode: village.countryCode,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "WorkStatus",
        "../models/administration/workStatus",
        (workStatus) => ({
          workStatusId: workStatus._id,
          workStatus: workStatus.workStatus,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "EmploymentType",
        "../models/administration/employmentType",
        (employmentType) => ({
          employmentTypeId: employmentType._id,
          employmentType: employmentType.employmentType,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "Relationship",
        "../models/administration/relationship",
        (relationship) => ({
          relationshipId: relationship._id,
          relationship: relationship.relationship,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "PayType",
        "../models/administration/payType",
        (payType) => ({
          payTypeId: payType._id,
          payType: payType.payType,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "FInstitution",
        "../models/administration/fInstitution.js",
        (fInstitution) => ({
          fInstitutionId: fInstitution._id,
          fInstitution: fInstitution.fInstitution,
          isActive: fInstitution.isActive,
          fInstitutionCode: fInstitution.fInstitutionCode,
          fInstitutionAddress: fInstitution.fInstitutionAddress,
          isCreditor: fInstitution.isCreditor,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "Allowance",
        "../models/administration/allowance",
        (allowance) => ({
          allowanceId: allowance._id,
          allowance: allowance.allowance,
          description: allowance.description,
          isActive: allowance.isActive,
          allowance: allowance.allowance,
          description: allowance.description,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "Deduction",
        "../models/administration/deduction",
        (deduction) => ({
          deductionId: deduction._id,
          deduction: deduction.deduction,
          description: deduction.description,
          isActive: deduction.isActive,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "UserRole",
        "../models/administration/userRole",
        (userRole) => ({
          userRoleId: userRole._id,
          userRole: userRole.userRole,
          isActive: userRole.isActive,
          userRole: userRole.userRole,
          description: userRole.description,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "AttendanceStatus",
        "../models/administration/attendanceStatus",
        (attendanceStatus) => ({
          statusId: attendanceStatus._id,
          status: attendanceStatus.status,
          description: attendanceStatus.description,
          isActive: attendanceStatus.isActive,
          isPaid: attendanceStatus.isPaid,
        })
      ),
      fetchAndTransformData(
        companyDb,
        "LeaveType",
        "../models/administration/leaveType",
        (leaveType) => ({
          leaveTypeId: leaveType._id,
          leaveType: leaveType.leaveType,
          description: leaveType.description,
          isActive: leaveType.isActive,
          isPaid: leaveType.isPaid,
          employeeRequested: leaveType.employeeRequested,
        })
      ),
    ]);

    const [
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
      allowances,
      deductions,
      userRoles,
      attendanceStatuses,
      leaveTypes,
    ] = data;

    const permissionsRaw = await Permission.find().sort({ permission: 1 });
    const permissions = permissionsRaw.map((permission) => ({
      permissionId: permission._id,
      permissionType: permission.permissionType,
      permission: permission.permission,
      description: permission.description,
    }));

    const Employee = getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );
    const employees = await Employee.find({ isActive: false });

    const positionCounts = {};
    const departmentCounts = {};
    const locationCounts = {};

    employees.forEach((employee) => {
      const { positionId, departmentId, locationId } = employee;
      if (positionId) {
        positionCounts[positionId] = (positionCounts[positionId] || 0) + 1;
      }
      if (departmentId) {
        departmentCounts[departmentId] =
          (departmentCounts[departmentId] || 0) + 1;
      }
      if (locationId) {
        locationCounts[locationId] = (locationCounts[locationId] || 0) + 1;
      }
    });

    positions.forEach((position) => {
      position.employeeCount = positionCounts[position.positionId] || 0;
    });

    departments.forEach((department) => {
      department.employeeCount = departmentCounts[department.departmentId] || 0;
    });

    locations.forEach((location) => {
      location.employeeCount = locationCounts[location.locationId] || 0;
    });

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
      allowances,
      deductions,
      userRoles,
      permissions,
      attendanceStatuses,
      leaveTypes,
    });
  } catch (err) {
    console.error(err);
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

    const Employee = getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const employees = await Employee.find({ isActive: true });

    const positionCounts = {};

    employees.forEach((employee) => {
      const { positionId } = employee;

      if (positionId) {
        positionCounts[positionId] = (positionCounts[positionId] || 0) + 1;
      }
    });

    const positionsRaw = await Position.find().populate({
      path: "departmentId",
      model: "Department",
    });
    const positions = positionsRaw.map((position) => ({
      positionId: position._id,
      position: position.position,
      department: position.departmentId.department,
      isActive: position.isActive,
      employeeCount: positionCounts[position._id] || 0,
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

    const Employee = getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const employees = await Employee.find({ isActive: true });

    const departmentCount = {};

    employees.forEach((employee) => {
      const { departmentId } = employee;

      if (departmentId) {
        departmentCount[departmentId] =
          (departmentCount[departmentId] || 0) + 1;
      }
    });

    const departmentsRaw = await Department.find().populate({
      path: "departmentTypeId",
      model: "DepartmentType",
    });
    const departments = departmentsRaw.map((department) => ({
      departmentId: department._id,
      department: department.department,
      isActive: department.isActive,
      departmentType: department.departmentTypeId.departmentType,
      employeeCount: departmentCount[department._id] || 0,
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

    const Employee = getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const employees = await Employee.find({ isActive: true });

    const locationCounts = {};

    employees.forEach((employee) => {
      const { locationId } = employee;

      if (locationId) {
        locationCounts[locationId] = (locationCounts[locationId] || 0) + 1;
      }
    });

    const locationsRaw = await Location.find();
    const locations = locationsRaw.map((location) => ({
      locationId: location._id,
      location: location.location,
      isActive: location.isActive,
      isMain: location.isMain,
      address: location.address,
      employeeCount: locationCounts[location._id] || 0,
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
      isCreditor: fInstitution.isCreditor,
      bankType: fInstitution.isCreditor ? "Creditor" : "Bank/Creditor",
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

//Allowances
const getAllowances = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Allowance = getModel(
      companyDb,
      "Allowance",
      "../models/administration/allowance"
    );
    const allowancesRaw = await Allowance.find();
    const allowances = allowancesRaw.map((allowance) => ({
      allowanceId: allowance._id,
      allowance: allowance.allowance,
      description: allowance.description,
      isActive: allowance.isActive,
      amount: allowance.amount,
    }));
    res.json(allowances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const addAllowance = async (req, res) => {
  const { clientDB } = req;
  const { allowance, description, isActive } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Allowance = getModel(
      companyDb,
      "Allowance",
      "../models/administration/allowance"
    );
    const newAllowance = new Allowance({
      allowance,
      description,
      isActive,
    });
    await newAllowance.save();
    res.json(newAllowance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const updateAllowance = async (req, res) => {
  const { clientDB } = req;
  const { allowanceId, allowance, description, isActive } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Allowance = getModel(
      companyDb,
      "Allowance",
      "../models/administration/allowance"
    );
    const updatedAllowance = await Allowance.findByIdAndUpdate(
      allowanceId,
      { allowance, description, isActive, updatedAt: new Date() },
      { new: true }
    );
    res.json(updatedAllowance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const removeAllowance = async (req, res) => {
  const { clientDB } = req;
  const { allowanceId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Allowance = getModel(
      companyDb,
      "Allowance",
      "../models/administration/allowance"
    );
    const allowance = await Allowance.findByIdAndDelete(allowanceId);
    if (!allowance)
      return res.status(404).json({ message: "Allowance not found" });
    res.json(allowance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//Deductions
const getDeductions = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Deduction = getModel(
      companyDb,
      "Deduction",
      "../models/administration/deduction"
    );
    const deductionsRaw = await Deduction.find();
    const deductions = deductionsRaw.map((deduction) => ({
      deductionId: deduction._id,
      deduction: deduction.deduction,
      description: deduction.description,
      isActive: deduction.isActive,
    }));
    res.json(deductions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const addDeduction = async (req, res) => {
  const { clientDB } = req;
  const { deduction, description, isActive } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Deduction = getModel(
      companyDb,
      "Deduction",
      "../models/administration/deduction"
    );
    const newDeduction = new Deduction({
      deduction,
      description,
      isActive,
    });
    await newDeduction.save();
    res.json(newDeduction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const updateDeduction = async (req, res) => {
  const { clientDB } = req;
  const { deductionId, deduction, description, isActive } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Deduction = getModel(
      companyDb,
      "Deduction",
      "../models/administration/deduction"
    );
    const updatedDeduction = await Deduction.findByIdAndUpdate(
      deductionId,
      { deduction, description, isActive, amount, updatedAt: new Date() },
      { new: true }
    );
    res.json(updatedDeduction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const removeDeduction = async (req, res) => {
  const { clientDB } = req;
  const { deductionId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Deduction = getModel(
      companyDb,
      "Deduction",
      "../models/administration/deduction"
    );
    const deduction = await Deduction.findByIdAndDelete(deductionId);
    if (!deduction)
      return res.status(404).json({ message: "Deduction not found" });
    res.json(deduction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//User Roles
const getUserRoles = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const UserRole = getModel(
      companyDb,
      "UserRole",
      "../models/administration/userRole"
    );
    const userRolesRaw = await UserRole.find().populate({
      path: "permissions",
    });
    const userRoles = userRolesRaw.map((userRole) => ({
      userRoleId: userRole._id,
      isActive: userRole.isActive,
      userRole: userRole.userRole,
      description: userRole.description,
      permissions: userRole.permissions.map((permission) => ({
        permissionId: permission._id,
        permission: permission.permission,
        description: permission.description,
      })),
    }));
    res.json(userRoles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const getRolePermissions = async (req, res) => {
  const { clientDB } = req;
  const { userRoleId } = req.params;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const UserRole = getModel(
      companyDb,
      "UserRole",
      "../models/administration/userRole"
    );
    const userRole = await UserRole.findById(userRoleId).populate({
      path: "permissions",
    });
    if (!userRole)
      return res.status(404).json({ message: "User Role not found" });
    res.json(userRole.permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const addUserRole = async (req, res) => {
  const { clientDB } = req;
  const { userRole, description, isActive } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const UserRole = getModel(
      companyDb,
      "UserRole",
      "../models/administration/userRole"
    );
    const newUserRole = new UserRole({
      userRole,
      description,
      isActive,
    });
    await newUserRole.save();
    res.json(newUserRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const updateUserRole = async (req, res) => {
  const { clientDB } = req;
  const { userRoleId, description, userRole, isActive } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const UserRole = getModel(
      companyDb,
      "UserRole",
      "../models/administration/userRole"
    );
    const updatedUserRole = await UserRole.findByIdAndUpdate(
      userRoleId,
      { userRole, isActive, description, updatedAt: new Date() },
      { new: true }
    );
    res.json(updatedUserRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const removeUserRole = async (req, res) => {
  const { clientDB } = req;
  const { userRoleId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const UserRole = getModel(
      companyDb,
      "UserRole",
      "../models/administration/userRole"
    );
    const userRole = await UserRole.findByIdAndDelete(userRoleId);
    if (!userRole)
      return res.status(404).json({ message: "User Role not found" });
    res.json(userRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const addPermissionToRole = async (req, res) => {
  const { clientDB } = req;
  const { userRoleId, permissionId } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const UserRole = getModel(
      companyDb,
      "UserRole",
      "../models/administration/userRole"
    );
    const userRole = await UserRole.findById(userRoleId).populate({
      path: "permissions",
    });

    if (!userRole)
      return res.status(404).json({ message: "User Role not found" });

    const permission = userRole.permissions.find(
      (p) => p._id.toString() === permissionId
    );
    if (permission)
      return res.status(400).json({ message: "Permission already exists" });

    userRole.permissions.push(permissionId);
    await userRole.save();

    res.json(userRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const removePermissionFromRole = async (req, res) => {
  const { clientDB } = req;
  const { userRoleId, permissionId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const UserRole = getModel(
      companyDb,
      "UserRole",
      "../models/administration/userRole"
    );
    const userRole = await UserRole.findById(userRoleId).populate({
      path: "permissions",
    });

    if (!userRole)
      return res.status(404).json({ message: "User Role not found" });

    const index = userRole.permissions.indexOf(permissionId);
    if (index === -1)
      return res.status(404).json({ message: "Permission not found" });

    userRole.permissions.splice(index, 1);
    await userRole.save();

    res.json(userRole);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
    console.error(error);
  }
};

//Permissions
const getPermissions = async (req, res) => {
  const { clientDB } = req;

  try {
    const permissionsRaw = await Permission.find();
    const permissions = permissionsRaw.map((permission) => ({
      permissionId: permission._id,
      permission: permission.permission,
      description: permission.description,
      isActive: permission.isActive,
    }));
    res.json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//Attendance Statuses
const getAttendanceStatuses = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const AttendanceStatus = getModel(
      companyDb,
      "AttendanceStatus",
      "../models/administration/attendanceStatus"
    );
    const attendanceStatusesRaw = await AttendanceStatus.find();
    const attendanceStatuses = attendanceStatusesRaw.map(
      (attendanceStatus) => ({
        statusId: attendanceStatus._id,
        status: attendanceStatus.status,
        description: attendanceStatus.description,
        isActive: attendanceStatus.isActive,
        isPaid: attendanceStatus.isPaid,
      })
    );
    res.json(attendanceStatuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const addAttendanceStatus = async (req, res) => {
  const { clientDB } = req;
  const { status, description, isActive, isPaid } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const AttendanceStatus = getModel(
      companyDb,
      "AttendanceStatus",
      "../models/administration/attendanceStatus"
    );

    const newAttendanceStatus = new AttendanceStatus({
      status,
      description,
      isActive,
      isPaid,
    });

    await newAttendanceStatus.save();

    res.json(newAttendanceStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const updateAttendanceStatus = async (req, res) => {
  const { clientDB } = req;
  const { statusId, status, description, isActive, isPaid } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const AttendanceStatus = getModel(
      companyDb,
      "AttendanceStatus",
      "../models/administration/attendanceStatus"
    );

    const updatedAttendanceStatus = await AttendanceStatus.findByIdAndUpdate(
      statusId,
      { statusId, status, isActive, isPaid, description },
      { new: true }
    );

    if (!updatedAttendanceStatus) {
      return res.status(404).json({ message: "Attendance status not found" });
    }

    res.json(updatedAttendanceStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const removeAttendanceStatus = async (req, res) => {
  const { clientDB } = req;
  const { statusId } = req.params;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const AttendanceStatus = getModel(
      companyDb,
      "AttendanceStatus",
      "../models/administration/attendanceStatus"
    );

    const deletedAttendanceStatus = await AttendanceStatus.findByIdAndDelete(
      statusId
    );

    if (!deletedAttendanceStatus) {
      return res.status(404).json({ message: "Attendance status not found" });
    }

    res.json(deletedAttendanceStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//Leave Types
const getLeaveTypes = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const LeaveType = getModel(
      companyDb,
      "LeaveType",
      "../models/administration/leaveType"
    );
    const leaveTypesRaw = await LeaveType.find();
    const leaveTypes = leaveTypesRaw.map((leaveType) => ({
      leaveTypeId: leaveType._id,
      leaveType: leaveType.leaveType,
      description: leaveType.description,
      isActive: leaveType.isActive,
      isPaid: leaveType.isPaid,
      employeeRequested: leaveType.employeeRequested,
    }));
    res.json(leaveTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const addLeaveType = async (req, res) => {
  const { clientDB } = req;
  const { leaveType, description, isActive, isPaid, employeeRequested } =
    req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const LeaveType = getModel(
      companyDb,
      "LeaveType",
      "../models/administration/leaveType"
    );

    const newLeaveType = new LeaveType({
      leaveType,
      description,
      isActive,
      isPaid,
    });

    await newLeaveType.save();

    res.json(newLeaveType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const updateLeaveType = async (req, res) => {
  const { clientDB } = req;
  const {
    leaveTypeId,
    leaveType,
    description,
    isActive,
    isPaid,
    employeeRequested,
  } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const LeaveType = getModel(
      companyDb,
      "LeaveType",
      "../models/administration/leaveType"
    );
    const updatedLeaveType = await LeaveType.findByIdAndUpdate(
      leaveTypeId,
      { leaveType, isActive, isPaid, description, employeeRequested },
      { new: true }
    );

    if (!updatedLeaveType) {
      return res.status(404).json({ message: "Leave Type not found" });
    }

    res.json(updatedLeaveType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const removeLeaveType = async (req, res) => {
  const { clientDB } = req;
  const { statusId } = req.params;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const LeaveType = getModel(
      companyDb,
      "LeaveType",
      "../models/administration/leaveType"
    );

    const deletedLeaveType = await LeaveType.findByIdAndDelete(statusId);

    if (!deletedLeaveType) {
      return res.status(404).json({ message: "Leave Type not found" });
    }

    res.json(deletedLeaveType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addAllowance,
  addAttendanceStatus,
  addDeduction,
  addDepartment,
  addFInstitution,
  addHoliday,
  addLocation,
  addPermissionToRole,
  addPosition,
  addUserRole,
  getAdministrationData,
  getAllowances,
  getAttendanceStatuses,
  getDeductions,
  getDepartments,
  getFInstitutions,
  getHolidays,
  getLocations,
  getPermissions,
  getPositions,
  getRolePermissions,
  getUserRoles,
  removeAllowance,
  removeAttendanceStatus,
  removeDeduction,
  removeDepartment,
  removeFInstitution,
  removeHoliday,
  removeLocation,
  removePermissionFromRole,
  removePosition,
  removeUserRole,
  updateAllowance,
  updateAttendanceStatus,
  updateDeduction,
  updateDepartment,
  updateFInstitution,
  updateHoliday,
  updateLocation,
  updatePosition,
  updateUserRole,
  getLeaveTypes,
  addLeaveType,
  updateLeaveType,
  removeLeaveType,
};
