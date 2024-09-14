const mongoose = require("mongoose");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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
    const employees = await Employee.find({});

    const employeesWithFullName = employees.map((employee) => ({
      ...employee.toObject(),
      fullName: `${employee.firstName} ${employee.lastName}`,
    }));

    res.json(employeesWithFullName);
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

const updateEmployee = async (req, res) => {};
const removeEmployee = async (req, res) => {};

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

    const attendanceRecordsRaw = await AttendanceRecord.find().populate(
      "status"
    );

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

const getAttendanceRecordsByEmployeeId = async (req, res) => {
  const { clientDB } = req;
  const { month, year, employeeId } = req.body;

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
      employeeId: employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).populate("status");

    console.log(attendanceRecordsRaw);

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
  getEmployees,
  addEmployee,
  addEmployees,
  updateEmployee,
  removeEmployee,
  getUsers,
  getAttendanceRecords,
  updateAttendanceRecord,
  updateAllEmployeesAttendanceRecord,
  getAttendanceRecordsByEmployeeId,
};
