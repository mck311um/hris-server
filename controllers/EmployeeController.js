const mongoose = require("mongoose");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const e = require("cors");

const awsBucketName = process.env.AWS_BUCKET_NAME;
const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
  region: awsRegion,
});

const getModel = (db, modelName, schemaPath) => {
  const schema = require(schemaPath).schema;
  return db.model(modelName, schema, modelName.toLowerCase() + "s");
};

const getEmployees = async (req, res) => {
  const { clientDB } = req;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Employee = getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const Department = getModel(
      companyDb,
      "Department",
      "../models/administration/department"
    );

    const Position = getModel(
      companyDb,
      "Position",
      "../models/administration/position"
    );

    const EmploymentType = getModel(
      companyDb,
      "EmploymentType",
      "../models/administration/employmentType"
    );

    const Location = getModel(
      companyDb,
      "Location",
      "../models/administration/location"
    );

    const WorkStatus = getModel(
      companyDb,
      "WorkStatus",
      "../models/administration/workStatus"
    );

    const employees = await Employee.find({})
      .populate({ path: "positionId" })
      .populate({ path: "departmentId" })
      .populate({ path: "employmentTypeId" })
      .populate({ path: "locationId" })
      .populate({ path: "workStatusId" });

    const employeesWithFullName = employees.map((employee) => ({
      addressLine1: employee.addressLine1,
      addressLine2: employee.addressLine2,
      age: employee.age,
      countryOfBirth: employee.countryOfBirth,
      dateOfBirth: employee.dateOfBirth,
      department: employee.departmentId.department,
      departmentId: employee.departmentId._id,
      email: employee.email,
      emergencyContact1Name: employee.emergencyContact1Name,
      emergencyContact1AddressLine1: employee.emergencyContact1AddressLine1,
      emergencyContact1AddressLine2: employee.emergencyContact1AddressLine2,
      emergencyContact1Email: employee.emergencyContact1Email,
      emergencyContact1Number: employee.emergencyContact1Number,
      emergencyContact1Parish: employee.emergencyContact1Parish,
      emergencyContact1Relationship: employee.emergencyContact1Relationship,
      emergencyContact1Village: employee.emergencyContact1Village,
      employeeId: employee.employeeId,
      employmentType: employee.employmentTypeId.employmentType,
      employmentTypeId: employee.employmentTypeId._id,
      firstName: employee.firstName,
      fullName: `${employee.firstName} ${employee.lastName}`,
      gender: employee.gender,
      hireDate: employee.hireDate,
      hireDate: employee.hireDate,
      homeNumber: employee.homeNumber,
      homeNumber: employee.homeNumber,
      isActive: employee.isActive,
      lastName: employee.lastName,
      location: employee.locationId.location,
      locationId: employee.locationId._id,
      maritalStatus: employee.maritalStatus,
      middleName: employee.middleName,
      mobileNumber: employee.mobileNumber,
      parish: employee.parish,
      position: employee.positionId.position,
      positionId: employee.positionId._id,
      socialSecurityNumber: employee.socialSecurityNumber,
      terminationDate: employee.terminationDate,
      village: employee.village,
      workStatus: employee.workStatusId.workStatus,
      workStatusId: employee.workStatusId._id,
    }));

    res.json(employeesWithFullName);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
const getEmployeeDetailsByEmployeeId = async (req, res) => {
  const { clientDB } = req;
  const { employeeId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Employee = getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

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

    const employeeDetailsRaw = await Employee.findOne({
      employeeId: employeeId,
    })
      .populate({ path: "positionId" })
      .populate({ path: "departmentId" });

    if (employeeDetailsRaw) {
      const hireDate = new Date(employeeDetailsRaw.hireDate);
      const currentDate = new Date();

      let yearsOfService = currentDate.getFullYear() - hireDate.getFullYear();
      let monthsOfService = currentDate.getMonth() - hireDate.getMonth();

      if (monthsOfService < 0) {
        yearsOfService--;
        monthsOfService += 12;
      }

      const employee = {
        addressLine1: employeeDetailsRaw.addressLine1,
        addressLine2: employeeDetailsRaw.addressLine2,
        age: employeeDetailsRaw.age,
        countryOfBirth: employeeDetailsRaw.countryOfBirth,
        dateOfBirth: employeeDetailsRaw.dateOfBirth,
        department: employeeDetailsRaw.departmentId.department,
        departmentId: employeeDetailsRaw.departmentId._id,
        email: employeeDetailsRaw.email,
        emergencyContact1AddressLine1:
          employeeDetailsRaw.emergencyContact1AddressLine1,
        emergencyContact1AddressLine2:
          employeeDetailsRaw.emergencyContact1AddressLine2,
        emergencyContact1Email: employeeDetailsRaw.emergencyContact1Email,
        emergencyContact1Name: employeeDetailsRaw.emergencyContact1Name,
        emergencyContact1Number: employeeDetailsRaw.emergencyContact1Number,
        emergencyContact1Parish: employeeDetailsRaw.emergencyContact1Parish,
        emergencyContact1Relationship:
          employeeDetailsRaw.emergencyContact1Relationship,
        emergencyContact1Village: employeeDetailsRaw.emergencyContact1Village,
        employeeId: employeeDetailsRaw.employeeId,
        employmentType: employeeDetailsRaw.employmentTypeId.employmentType,
        employmentTypeId: employeeDetailsRaw.employmentTypeId._id,
        firstName: employeeDetailsRaw.firstName,
        fullName: `${employeeDetailsRaw.firstName} ${employeeDetailsRaw.lastName}`,
        gender: employeeDetailsRaw.gender,
        hireDate: employeeDetailsRaw.hireDate,
        hireDate: employeeDetailsRaw.hireDate,
        homeNumber: employeeDetailsRaw.homeNumber,
        homeNumber: employeeDetailsRaw.homeNumber,
        isActive: employeeDetailsRaw.isActive,
        lastName: employeeDetailsRaw.lastName,
        location: employeeDetailsRaw.locationId.location,
        locationId: employeeDetailsRaw.locationId._id,
        maritalStatus: employeeDetailsRaw.maritalStatus,
        middleName: employeeDetailsRaw.middleName,
        mobileNumber: employeeDetailsRaw.mobileNumber,
        monthsOfService,
        parish: employeeDetailsRaw.parish,
        position: employeeDetailsRaw.positionId.position,
        positionId: employeeDetailsRaw.positionId._id,
        socialSecurityNumber: employeeDetailsRaw.socialSecurityNumber,
        terminationDate: employeeDetailsRaw.terminationDate,
        vacationBalance: 50,
        village: employeeDetailsRaw.village,
        workStatus: employeeDetailsRaw.workStatusId.workStatus,
        workStatusId: employeeDetailsRaw.workStatusId._id,
        yearsOfService,
        socialSecurityNo: employeeDetailsRaw.socialSecurityNo,
        payType: employeeDetailsRaw.payType,
        payRate: employeeDetailsRaw.payRate,
        accountNumber: employeeDetailsRaw.accountNumber,
        fInstitutionId: employeeDetailsRaw.fInstitutionId,
      };
      res.json(employee);
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
const addEmployee = async (req, res) => {
  const { clientDB, clientCode } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Employee = getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const employeeData = req.body;
    const lastNamePrefix = employeeData.lastName.slice(0, 3).toUpperCase();
    const firstNamePrefix = employeeData.firstName.slice(0, 1).toUpperCase();

    const idPrefix = `${lastNamePrefix}${firstNamePrefix}`;

    const lastEmployee = await Employee.findOne({
      employeeId: { $regex: `^${idPrefix}` },
    }).sort({ employeeId: -1 });

    let newEmployeeId;
    if (lastEmployee) {
      const lastId = parseInt(lastEmployee.employeeId.slice(4), 10);
      newEmployeeId = `${idPrefix}${(lastId + 1).toString().padStart(3, "0")}`;
    } else {
      newEmployeeId = `${idPrefix}001`;
    }
    employeeData.employeeId = newEmployeeId;

    const newEmployee = new Employee(employeeData);
    await newEmployee.save();
    await createS3Folder(clientCode, newEmployee.employeeId);

    res.json(newEmployee);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
const addEmployees = async (req, res) => {
  const { clientDB, clientCode } = req;
  const employeeDataArray = req.body; // Expecting an array of employee objects

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Employee = getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const results = [];

    for (const employeeData of employeeDataArray) {
      const lastNamePrefix = employeeData.lastName.slice(0, 3).toUpperCase();
      const firstNamePrefix = employeeData.firstName.slice(0, 1).toUpperCase();
      const idPrefix = `${lastNamePrefix}${firstNamePrefix}`;

      const lastEmployee = await Employee.findOne({
        employeeId: { $regex: `^${idPrefix}` },
      }).sort({ employeeId: -1 });

      let newEmployeeId;
      if (lastEmployee) {
        const lastId = parseInt(lastEmployee.employeeId.slice(4), 10);
        newEmployeeId = `${idPrefix}${(lastId + 1)
          .toString()
          .padStart(3, "0")}`;
      } else {
        newEmployeeId = `${idPrefix}001`;
      }
      employeeData.employeeId = newEmployeeId;

      const newEmployee = new Employee(employeeData);
      await newEmployee.save();
      await createS3Folder(clientCode, newEmployee.employeeId);

      results.push(newEmployee);
    }

    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
const updateEmployee = async (req, res) => {
  const { clientDB } = req;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Employee = getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const employeeData = req.body;
    const { employeeId } = req.body;

    const employee = await Employee.findOneAndUpdate(
      { employeeId },
      employeeData,
      { new: true }
    ).exec();

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
const removeEmployee = async (req, res) => {};

//Users
const getUsers = async (req, res) => {
  const { clientDB } = req;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const User = getModel(companyDb, "User", "../models/user.js");

    const users = await User.find().select(
      "userName roleId employeeId requirePasswordChange"
    );
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

//Attendance
const getAttendanceRecords = async (req, res) => {
  const { clientDB } = req;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const AttendanceRecord = getModel(
      companyDb,
      "AttendanceRecord",
      "../models/employee/attendanceRecord.js"
    );

    const AttendanceStatus = getModel(
      companyDb,
      "AttendanceStatus",
      "../models/administration/attendanceStatus"
    );

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    );

    const attendanceRecordsRaw = await AttendanceRecord.find({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    }).populate("status");

    const attendanceRecords = attendanceRecordsRaw.map((attendanceRecord) => ({
      attendanceRecordId: attendanceRecord._id,
      employeeId: attendanceRecord.employeeId,
      date: attendanceRecord.date,
      status: attendanceRecord.status.status,
    }));

    res.json(attendanceRecords);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
const getAttendanceRecordsByDate = async (req, res) => {
  const { clientDB } = req;
  const { month, year } = req.body;

  const monthPadded = month.padStart(2, "0");
  const startDate = new Date(`${year}-${monthPadded}-01T00:00:00.000Z`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);
  endDate.setHours(23, 59, 59, 999);

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const AttendanceRecord = getModel(
      companyDb,
      "AttendanceRecord",
      "../models/employee/attendanceRecord.js"
    );

    const AttendanceStatus = getModel(
      companyDb,
      "AttendanceStatus",
      "../models/administration/attendanceStatus"
    );

    const attendanceRecordsRaw = await AttendanceRecord.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate("status");

    const attendanceRecords = attendanceRecordsRaw.map((attendanceRecord) => ({
      attendanceRecordId: attendanceRecord._id,
      employeeId: attendanceRecord.employeeId,
      date: attendanceRecord.date,
      status: attendanceRecord.status.status,
    }));

    res.json(attendanceRecords);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};
const updateAttendanceRecord = async (req, res) => {
  const { clientDB } = req;
  const { attendanceRecordId, status, notes, updatedBy } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const AttendanceRecord = getModel(
      companyDb,
      "AttendanceRecord",
      "../models/employee/attendanceRecord.js"
    );

    const updatedAttendanceRecord = await AttendanceRecord.findByIdAndUpdate(
      attendanceRecordId,
      {
        status: status,
        updatedBy: updatedBy,
        notes: notes,
        updatedAt: Date.now(),
        updatedBy: updatedBy,
      },
      { new: true }
    );

    res.json(updatedAttendanceRecord);
  } catch (error) {}
};
const updateAllEmployeesAttendanceRecord = async (req, res) => {
  const { clientDB } = req;
  const { status, date, updatedBy } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const AttendanceRecord = getModel(
      companyDb,
      "AttendanceRecord",
      "../models/employee/attendanceRecord.js"
    );

    const updatedCount = await AttendanceRecord.updateMany(
      { date: date },
      { status: status, updatedBy: updatedBy, updatedAt: Date.now() }
    );

    res.json({ updatedCount });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

//Time Off
const addTimeOffRequest = async (req, res) => {
  const { clientDB } = req;
  const { employeeId, days, leaveTypeId, notes } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const TimeOffRequest = getModel(
      companyDb,
      "TimeOffRequest",
      "../models/employee/timeOfRequest.js"
    );

    const newTimeOffRequest = new TimeOffRequest({
      employeeId,
      days,
      leaveTypeId,
      notes,
    });

    await newTimeOffRequest.save();

    res.json(newTimeOffRequest);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
const getTimeOffRequests = async (req, res) => {
  const { clientDB } = req;
  try {
  } catch (error) {}
};
const getTimeOffRequestsByEmployeeId = async (req, res) => {
  const { clientDB } = req;
  const { employeeId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const TimeOffRequest = getModel(
      companyDb,
      "TimeOffRequest",
      "../models/employee/timeOfRequest"
    );

    const LeaveType = getModel(
      companyDb,
      "LeaveType",
      "../models/administration/leaveType"
    );

    const timeOffRequestsRaw = await TimeOffRequest.find({
      employeeId: employeeId,
    }).populate({ path: "leaveTypeId" });

    const timeOffRequests = timeOffRequestsRaw.map((timeOffRequest) => {
      return {
        timeOffRequestId: timeOffRequest._id,
        employeeId: timeOffRequest.employeeId,
        days: timeOffRequest.days,
        notes: timeOffRequest.notes,
        status: timeOffRequest.status,
        leaveType: timeOffRequest.leaveTypeId.leaveType,
        dateMade: timeOffRequest.dateMade,
      };
    });

    res.json(timeOffRequests);
  } catch (error) {}
};

const createS3Folder = async (clientCode, empId) => {
  const folderKey = `${clientCode}/Employees/${empId}/`;

  const params = {
    Bucket: awsBucketName,
    Key: folderKey,
    Body: "",
  };
  const command = new PutObjectCommand(params);

  try {
    await s3.send(command);
  } catch (error) {
    console.error("Error creating folder:", error);
  }
};

module.exports = {
  addEmployee,
  addEmployees,
  getAttendanceRecords,
  getAttendanceRecordsByDate,
  getEmployeeDetailsByEmployeeId,
  getEmployees,
  getUsers,
  removeEmployee,
  updateAllEmployeesAttendanceRecord,
  updateAttendanceRecord,
  updateEmployee,
  addTimeOffRequest,
  getTimeOffRequests,
  getTimeOffRequestsByEmployeeId,
  updateEmployee,
};
