const mongoose = require("mongoose");
const Client = require("../models/client/client");

const getModel = (db, modelName, schemaPath) => {
  const schema = require(schemaPath).schema;
  return db.model(modelName, schema, modelName.toLowerCase() + "s");
};

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function subtractDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

async function calculateSickLeave(
  employeeId,
  startDate,
  endDate,
  clientCode,
  fullyPaid
) {
  let isPaid = false;
  let paidDays = 0;
  let totalDays = 0;
  let daysTaken = 0;
  let systemComment = "";
  let benefits = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw new Error("End date is before start date.");
  }

  let currentDate = new Date(start);
  while (currentDate <= end) {
    if (currentDate.getDay() !== 6) {
      totalDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const client = await Client.findOne({ clientCode });

  if (!client) {
    throw new Error("No Client found in the database.");
  }

  const companyDb = mongoose.connection.useDb(client.dbName);

  const SickLeaveRecord = getModel(
    companyDb,
    "SickLeaveRecord",
    "../models/employee/sickLeaveRecord.js"
  );

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

  const employeeRecords = await SickLeaveRecord.find({ employeeId });
  const employeeDetails = await Employee.findOne({ employeeId });

  daysTaken = getEmployeeAnnualSickLeave(employeeRecords);
  tenure = getEmployeeTenure(employeeDetails);

  await createAttendanceRecords(start, end, client, employeeDetails);

  if (tenure <= client.paidSickTenured) {
    systemComment =
      "Employee is under tenure and is unable to get paid sick leave";
    paidDays = 0;
    isPaid = false;
    benefits = 0;
  } else {
    if (daysTaken >= client.annualSickLeave) {
      systemComment = "Employee has reached their annual sick leave limit.";
      paidDays = 0;
      isPaid = false;
      benefits = 0;
    } else {
      potentialPaidDays = Math.min(
        totalDays,
        client.annualSickLeave - daysTaken
      );
      if (potentialPaidDays < 4) {
        systemComment =
          "Employee has less than 4 days of sick leave, so they do not qualify for paid sick leave.";
        paidDays = 0;
        isPaid = false;
        benefits = 0;
      } else {
        paidDays = potentialPaidDays;
        isPaid = paidDays > 0;
        systemComment = `Employee has qualified for ${paidDays} paid sick days `;
        benefits = await calculateSickPay(
          client,
          paidDays,
          employeeDetails,
          start,
          fullyPaid
        );
      }
    }
  }
  return { totalDays, paidDays, isPaid, systemComment, benefits };
}

async function createAttendanceRecords(startDate, endDate, client, employee) {
  const companyDb = mongoose.connection.useDb(client.dbName);
  let currentDate = new Date(startDate);
  const finalDate = new Date(endDate);
  finalDate.setDate(finalDate.getDate());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const AttendanceRecord = getModel(
    companyDb,
    "AttendanceRecord",
    "../models/employee/attendanceRecord.js"
  );

  while (currentDate <= finalDate) {
    const dayName = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    if (client.openDays.includes(dayName)) {
      await AttendanceRecord.findOneAndUpdate(
        {
          employeeId: employee.employeeId,
          date: currentDate,
        },
        {
          $set: {
            date: currentDate,
            status: "66e46c1f1207609d25684666",
            updatedAt: today,
            updatedBy: "System",
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

async function calculateSickPay(
  client,
  paidDays,
  employee,
  commencementDate,
  fullyPaid
) {
  const companyDb = mongoose.connection.useDb(client.dbName);

  const payrollRecord = getPayrollRecord(client);
  const threeMonthsBefore = new Date(commencementDate);
  threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);
  const thirteenWeeksBefore = new Date(commencementDate);
  thirteenWeeksBefore.setDate(thirteenWeeksBefore.getDate() - 91);
  let benefits = 0;

  const EmployeePayRecord = getModel(
    companyDb,
    "EmployeePayRecord",
    "../models/payroll/empPayRecord"
  );

  if (employee.payType === "Monthly") {
    const employeeRecords = await EmployeePayRecord.find({
      employeeId: employee.employeeId,
      payType: { $nin: ["SICK", "MAT"] },
      payDate: {
        $gte: threeMonthsBefore,
        $lte: new Date(commencementDate),
      },
    });

    const netThreeMonths = employeeRecords.reduce((acc, record) => {
      acc += record.payAmount;
      return acc;
    }, 0);

    if (!fullyPaid) {
      benefits = ((((netThreeMonths / 13) * 0.4) / 6) * paidDays).toFixed(2);
    } else {
      benefits = ((((netThreeMonths / 13) * 1) / 6) * paidDays).toFixed(2);
    }
  } else if (employee.payType === "Weekly") {
    const employeeRecords = await EmployeePayRecord.find({
      employeeId: employee.employeeId,
      payType: { $nin: ["SICK", "MAT"] },
      payDate: {
        $gte: thirteenWeeksBefore,
        $lte: new Date(commencementDate),
      },
    });

    const netThirteenWeeks = employeeRecords.reduce((acc, record) => {
      acc += record.payAmount;
      return acc;
    }, 0);

    if (!fullyPaid) {
      benefits = ((((netThirteenWeeks / 13) * 0.4) / 52) * paidDays).toFixed(2);
    } else {
      benefits = ((((netThirteenWeeks / 13) * 1) / 52) * paidDays).toFixed(2);
    }
  } else if (employee.payType === "Fortnightly") {
    benefits = 0;
  }

  return benefits;
}

async function getPayrollRecord(client) {
  const companyDb = mongoose.connection.useDb(client.dbName);
  const today = new Date();
  const year = today.getFullYear();

  const PayrollRecord = getModel(
    companyDb,
    "PayrollRecord",
    "../models/payroll/payrollRecord"
  );

  const latestUnpaidRecord = await PayrollRecord.findOne({
    isPaid: false,
  }).sort({ payDate: -1 });

  let newPayrollRecord;

  if (!latestUnpaidRecord) {
    latestPaidRecord = await PayrollRecord.findOne({
      isPaid: true,
    }).sort({ payDate: -1 });

    if (!latestPaidRecord) {
      const firstPayroll = new Date(client.initialPayroll);
      console.log(client.initialPayroll);
      if (client.payrollFrequency === "Monthly") {
        newPayrollRecord = new PayrollRecord({
          payrollStartDate: subtractDays(firstPayroll, 31),
          payrollEndDate: subtractDays(firstPayroll, 1),
          payDate: getPayDate(firstPayroll),
          payrollId: `${year}-1`,
          payrollNumber: 1,
        });
      }
    } else {
      if (client.payrollFrequency === "Monthly") {
        newPayrollRecord = new PayrollRecord({
          payrollStartDate: latestPaidRecord.payDate,
          payrollEndDate: addDays(latestPaidRecord.payDate, 29),
          payDate: getPayDate(addDays(latestPaidRecord.payDate, 30)),
          payrollId: `${year}-${latestPaidRecord.payrollNumber + 1}`,
        });
      }
    }

    if (newPayrollRecord) {
      await newPayrollRecord.save();
    }

    return newPayrollRecord;
  } else {
    return latestUnpaidRecord;
  }
}

function getPayDate(date) {
  const result = new Date(date);

  if (!isValidDate(result)) {
    throw new Error("Invalid date passed to getPayDate");
  }

  const dayOfWeek = result.getDay();

  if (dayOfWeek === 6) {
    result.setDate(result.getDate() - 1);
  } else if (dayOfWeek === 0) {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

function getEmployeeAnnualSickLeave(records) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today.getFullYear(), 0, 1);
  const end = today;

  const annualLeave = records.reduce((acc, record) => {
    if (!record.startDate || !record.endDate || record.paidDays === undefined) {
      console.log("Invalid record");
      return acc;
    }

    const recordStart = new Date(record.startDate);
    const recordEnd = new Date(record.endDate);

    if (recordEnd < start) {
      return acc;
    }

    acc += record.paidDays;

    return acc;
  }, 0);

  return annualLeave;
}

function getEmployeeTenure(employee) {
  const hireDate = new Date(employee.hireDate);
  const currentDate = new Date();
  const diffInMillis = currentDate - hireDate;
  const tenure = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));

  return tenure;
}

module.exports = {
  calculateSickLeave,
};
