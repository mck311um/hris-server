const cron = require("node-cron");
const mongoose = require("mongoose");
const Client = require("../models/client/client");

const getModel = (db, modelName, schemaPath) => {
  const schema = require(schemaPath).schema;
  return db.model(modelName, schema, modelName.toLowerCase() + "s");
};

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

async function getTestClientAttendance() {
  const client = await Client.findOne({ clientCode: "TEST-001" });
  if (!client) {
    console.log("No Client found in the database.");
    return;
  }

  console.log("Attendance for TEST is being simulated...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayName = daysOfWeek[today.getDay()];
  const companyDb = mongoose.connection.useDb(client.dbName);
  const Employee = getModel(
    companyDb,
    "Employee",
    "../models/employee/employee.js"
  );
  const AttendanceRecord = getModel(
    companyDb,
    "AttendanceRecord",
    "../models/employee/attendanceRecord.js"
  );
  const Holidays = getModel(
    companyDb,
    "Holiday",
    "../models/employee/attendanceRecord.js"
  );

  const employees = await Employee.find({ isActive: true });
  const holidays = await Holidays.find({
    hasPassed: false,
    isPublic: true,
    isOff: true,
    date: today,
  });

  let status;
  if (client.openDays.includes(dayName)) {
    status =
      holidays.length > 0
        ? "66e46cab1207609d2568467b"
        : "66e46abe1207609d2568463c";
  } else {
    status = "66e46cbc1207609d25684682";
  }

  for (const employee of employees) {
    const employeeAttendanceRecords = await AttendanceRecord.find({
      employeeId: employee.employeeId,
      date: today,
    });

    if (employeeAttendanceRecords.length === 0) {
      const newAttendanceRecord = new AttendanceRecord({
        employeeId: employee.employeeId,
        date: today,
        status: status,
        createdAt: today,
        updatedAt: today,
        updatedBy: "System",
      });
      await newAttendanceRecord.save();
    }
  }
}

cron.schedule("0 8 * * *", () => {
  console.log("Running Attendance Job");
  getTestClientAttendance();
  console.log("Job Completed Successfully");
});
