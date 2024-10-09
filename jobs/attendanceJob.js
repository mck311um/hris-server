const cron = require("node-cron");
const mongoose = require("mongoose");
const Client = require("../models/client/client");
const utils = require("../utils/functions");

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

async function getTestClientAttendance() {
  const client = await Client.findOne({ clientCode: "TEST-001" });
  if (!client) {
    console.log("No Client found in the database.");
    return;
  }

  console.log("Attendance for TEST is being simulated...");
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const dayName = daysOfWeek[today.getDay()];
  const companyDb = mongoose.connection.useDb(client.dbName);
  const Employee = utils.getModel(
    companyDb,
    "Employee",
    "../models/employee/employee.js"
  );
  const AttendanceRecord = utils.getModel(
    companyDb,
    "AttendanceRecord",
    "../models/employee/attendanceRecord.js"
  );
  const Holidays = utils.getModel(
    companyDb,
    "Holiday",
    "../models/employee/attendanceRecord.js"
  );
  const AttendanceStatus = utils.getModel(
    companyDb,
    "AttendanceStatus",
    "../models/administration/attendanceStatus"
  );

  const holidayStatus = await AttendanceStatus.findOne({ status: "Holiday" });
  const presentStatus = await AttendanceStatus.findOne({ status: "Present" });
  const closedStatus = await AttendanceStatus.findOne({ status: "Closed" });

  const startOfDay = new Date(today);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const employees = await Employee.find({ isActive: true });
  const holidays = await Holidays.find({
    isPublic: true,
    isOff: true,
    observedDate: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  });

  let status;

  if (client.openDays.includes(dayName)) {
    status = holidays.length > 0 ? holidayStatus : presentStatus;
  } else {
    status = closedStatus;
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
        status: status._id,
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
