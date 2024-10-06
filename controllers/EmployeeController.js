const mongoose = require("mongoose");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { calculateSickLeave } = require("../functions/sickLeave");
const Client = require("../models/client/client");
const utils = require("../utils/functions");

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

const getEmployees = async (req, res) => {
  const { clientDB } = req;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const Employee = utils.getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const Department = utils.getModel(
      companyDb,
      "Department",
      "../models/administration/department"
    );

    const Position = utils.getModel(
      companyDb,
      "Position",
      "../models/administration/position"
    );

    const EmploymentType = utils.getModel(
      companyDb,
      "EmploymentType",
      "../models/administration/employmentType"
    );

    const Location = utils.getModel(
      companyDb,
      "Location",
      "../models/administration/location"
    );

    const WorkStatus = utils.getModel(
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
      profilePic: employee.profilePic,
    }));

    res.json(employeesWithFullName);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getEmployeeDetailsByEmployeeId = async (req, res) => {
  const { clientDB } = req;
  const { employeeId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Employee = utils.getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const Position = utils.getModel(
      companyDb,
      "Position",
      "../models/administration/position"
    );

    const Department = utils.getModel(
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
        profilePic: employeeDetailsRaw.profilePic,
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

    const Employee = utils.getModel(
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
    const Employee = utils.getModel(
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
    const Employee = utils.getModel(
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
    const User = utils.getModel(companyDb, "User", "../models/user.js");

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
    const AttendanceRecord = utils.getModel(
      companyDb,
      "AttendanceRecord",
      "../models/employee/attendanceRecord.js"
    );

    const AttendanceStatus = utils.getModel(
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
      date: utils.formatDate(attendanceRecord.date),
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
    const AttendanceRecord = utils.getModel(
      companyDb,
      "AttendanceRecord",
      "../models/employee/attendanceRecord.js"
    );

    const AttendanceStatus = utils.getModel(
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
    const AttendanceRecord = utils.getModel(
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
    const AttendanceRecord = utils.getModel(
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
    const TimeOffRequest = utils.getModel(
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
    const TimeOffRequest = utils.getModel(
      companyDb,
      "TimeOffRequest",
      "../models/employee/timeOfRequest"
    );

    const LeaveType = utils.getModel(
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
        dateMade: utils.formatDate(timeOffRequest.dateMade),
      };
    });

    res.json(timeOffRequests);
  } catch (error) {}
};
const actionTimeOffRequest = async (req, res) => {
  const { clientDB } = req;
  const { timeOffRequestId, actionedBy, newStatus } = req.body;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const TimeOffRequest = utils.getModel(
      companyDb,
      "TimeOffRequest",
      "../models/employee/timeOfRequest.js"
    );

    const updatedTimeOffRequest = await TimeOffRequest.findByIdAndUpdate(
      timeOffRequestId,
      { status: newStatus, actionedBy },
      { new: true }
    );

    res.json(updatedTimeOffRequest);
  } catch (error) {}
};

//Sick Leave
const getSickLeaveRecords = async (req, res) => {
  const { clientDB } = req;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const SickLeaveRecord = utils.getModel(
      companyDb,
      "SickLeaveRecord",
      "../models/employee/sickLeaveRecord.js"
    );
    const Employee = utils.getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );
    const employees = await Employee.find({});
    const sickLeaveRecordsRaw = await SickLeaveRecord.find({
      isDeleted: false,
    });

    const employeeMap = new Map(
      employees.map((employee) => [
        employee.employeeId.toString(),
        `${employee.firstName} ${employee.lastName}`,
      ])
    );

    const sickLeaveRecords = sickLeaveRecordsRaw.map((sickLeaveRecord) => {
      const fullName = employeeMap.get(sickLeaveRecord.employeeId.toString());
      return {
        recordId: sickLeaveRecord._id,
        employeeId: sickLeaveRecord.employeeId,
        fullName: fullName,
        startDate: utils.formatDate(new Date(sickLeaveRecord.startDate)),
        endDate: utils.formatDate(new Date(sickLeaveRecord.endDate)),
        illness: sickLeaveRecord.illness,
        notes: sickLeaveRecord.notes,
        status: sickLeaveRecord.status,
        totalDays: sickLeaveRecord.totalDays,
      };
    });

    res.json(sickLeaveRecords);
  } catch (error) {
    console.error("Error fetching sick leave records:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addSickLeaveRecord = async (req, res) => {
  const { clientDB, clientCode } = req;
  const { employeeId, startDate, endDate, illness, notes, fullyPaid } =
    req.body;

  try {
    const client = await Client.findOne({ clientCode });

    if (!client) {
      throw new Error("No Client found in the database.");
    }

    const companyDb = mongoose.connection.useDb(clientDB);

    const SickLeaveRecord = utils.getModel(
      companyDb,
      "SickLeaveRecord",
      "../models/employee/sickLeaveRecord.js"
    );

    const PayrollRecord = utils.getModel(
      companyDb,
      "PayrollRecord",
      "../models/payroll/payrollRecord"
    );

    const EmployeePayRecord = utils.getModel(
      companyDb,
      "EmployeePayRecord",
      "../models/payroll/empPayRecord"
    );

    const unpaidRecords = await PayrollRecord.find({
      isPaid: false,
    }).sort({ payDate: 1 });

    const { totalDays, paidDays, isPaid, systemComment, benefits } =
      await calculateSickLeave(
        employeeId,
        startDate,
        endDate,
        clientCode,
        fullyPaid
      );

    const newSickLeaveRecord = new SickLeaveRecord({
      employeeId,
      startDate,
      endDate,
      illness,
      notes,
      totalDays,
      paidDays,
      isPaid,
      benefits,
      systemComment,
    });

    console.log(newSickLeaveRecord);
    // await newSickLeaveRecord.save();

    if (benefits > 0) {
      if (client.payrollFrequency === "Monthly") {
        const oldestUnpaidRecord = unpaidRecords[0] || null;
        const nextUnpaidRecord = unpaidRecords[1] || null;

        if (
          oldestUnpaidRecord &&
          new Date(endDate) > new Date(oldestUnpaidRecord.payDate)
        ) {
          console.log(benefits);
          daysInFirstPayroll = utils.getDaysDifference(
            startDate,
            oldestUnpaidRecord.payDate
          );
          daysInNextPayroll = paidDays - daysInFirstPayroll;
          dailyBenefits = (benefits / paidDays).toFixed(2);
          const today = new Date();
          const year = today.getFullYear();

          if (nextUnpaidRecord) {
            const newEmpPayRecord = new EmployeePayRecord({
              payrollId: oldestUnpaidRecord.payrollId,
              payAmount: (dailyBenefits * daysInFirstPayroll).toFixed(2),
              payType: "SICK",
              isPaid: false,
              employeeId,
              payDate: oldestUnpaidRecord.payDate,
              referenceId: newSickLeaveRecord._id,
            });

            const secondEmpPayRecord = new EmployeePayRecord({
              payrollId: nextUnpaidRecord.payrollId,
              payAmount: (dailyBenefits * daysInNextPayroll).toFixed(2),
              payType: "SICK",
              isPaid: false,
              employeeId,
              payDate: nextUnpaidRecord.payDate,
              referenceId: newSickLeaveRecord._id,
            });
            // await newEmpPayRecord.save();
            // await secondEmpPayRecord.save();
            console.log(newEmpPayRecord);
            console.log(secondEmpPayRecord);
          } else {
            const newPayrollRecord = new PayrollRecord({
              payrollStartDate: oldestUnpaidRecord.payDate,
              payrollEndDate: utils.addDays(oldestUnpaidRecord.payDate, 29),
              payDate: utils.getPayDate(
                utils.addDays(oldestUnpaidRecord.payDate, 30)
              ),
              payrollId: `${year}-${oldestUnpaidRecord.payrollNumber + 1}`,
              payrollNumber: oldestUnpaidRecord.payrollNumber + 1,
            });

            await newPayrollRecord.save();

            const newEmpPayRecord = new EmployeePayRecord({
              payrollId: oldestUnpaidRecord.payrollId,
              payAmount: dailyBenefits * daysInFirstPayroll,
              payType: "SICK",
              isPaid: false,
              employeeId,
              payDate: oldestUnpaidRecord.payDate,
              referenceId: newSickLeaveRecord._id,
            });

            const secondEmpPayRecord = new EmployeePayRecord({
              payrollId: newPayrollRecord.payrollId,
              payAmount: dailyBenefits * daysInNextPayroll,
              payType: "SICK",
              isPaid: false,
              employeeId,
              payDate: newPayrollRecord.payDate,
              referenceId: newSickLeaveRecord._id,
            });
            // await newEmpPayRecord.save();
            // await secondEmpPayRecord.save();

            console.log(newEmpPayRecord);
            console.log(secondEmpPayRecord);
          }
        } else if (oldestUnpaidRecord) {
          const newEmpPayRecord = new EmployeePayRecord({
            payrollId: oldestUnpaidRecord.payrollId,
            payAmount: benefits,
            payType: "SICK",
            isPaid: false,
            employeeId,
            payDate: oldestUnpaidRecord.payDate,
            referenceId: newSickLeaveRecord._id,
          });
          // await newEmpPayRecord.save();
          console.log(newEmpPayRecord);
        }
      } else {
        // Handle non-monthly payroll case
      }
    }

    res.json(newSickLeaveRecord);
  } catch (error) {
    console.error("Error adding sick leave record:", error);
    res.status(400).json({ message: "Bad Request" });
  }
};

const getSickLeaveData = async (req, res) => {
  const { clientDB, clientCode } = req;
  const { recordId } = req.params;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const SickLeaveRecord = utils.getModel(
      companyDb,
      "SickLeaveRecord",
      "../models/employee/sickLeaveRecord.js"
    );

    const EmployeePayRecord = utils.getModel(
      companyDb,
      "EmployeePayRecord",
      "../models/payroll/empPayRecord"
    );

    const client = await Client.findOne({ clientCode });
    const sickLeaveRecord = await SickLeaveRecord.findById(recordId);
    let payRecords;
    let sickPayRecords;

    if (!client) {
      throw new Error("No Client found in the database.");
    }

    if (client.payrollFrequency === "Monthly") {
      const threeMonthsBefore = new Date(sickLeaveRecord.startDate);
      threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);

      const employeeRecords = await EmployeePayRecord.find({
        employeeId: sickLeaveRecord.employeeId,
        payType: { $nin: ["SICK", "MAT"] },
        payDate: {
          $gte: threeMonthsBefore,
          $lte: new Date(sickLeaveRecord.startDate),
        },
      });

      const sickPayRecordsRaw = await EmployeePayRecord.find({
        referenceId: sickLeaveRecord._id,
      });

      sickPayRecords = sickPayRecordsRaw.map((record) => {
        return {
          payrollId: record.payrollId,
          payAmount: record.payAmount,
        };
      });

      payRecords = employeeRecords.reduce((acc, record) => {
        const existingRecord = acc.find(
          (r) => r.payrollId === record.payrollId
        );

        if (existingRecord) {
          existingRecord.payAmount += record.payAmount;
        } else {
          acc.push({
            payrollId: record.payrollId,
            payDate: record.payDate,
            payAmount: record.payAmount,
          });
        }
        return acc;
      }, []);
    } else {
    }

    res.json({
      sickLeaveRecord,
      payRecords,
      sickPayRecords,
    });
  } catch (error) {
    console.error("Error fetching sick leave data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const updateSickLeaveRecord = async (req, res) => {};

//Probation
const getEmployeesOnProbation = async (req, res) => {
  const { clientDB } = req;

  try {
    const today = new Date();
    const companyDb = mongoose.connection.useDb(clientDB);
    const Department = utils.getModel(
      companyDb,
      "Department",
      "../models/administration/department"
    );

    const Position = utils.getModel(
      companyDb,
      "Position",
      "../models/administration/position"
    );

    const EmploymentType = utils.getModel(
      companyDb,
      "EmploymentType",
      "../models/administration/employmentType"
    );

    const Location = utils.getModel(
      companyDb,
      "Location",
      "../models/administration/location"
    );

    const WorkStatus = utils.getModel(
      companyDb,
      "WorkStatus",
      "../models/administration/workStatus"
    );

    const Employee = utils.getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const employeesRaw = await Employee.find({})
      .populate({ path: "positionId" })
      .populate({ path: "departmentId" })
      .populate({ path: "employmentTypeId" })
      .populate({ path: "locationId" })
      .populate({ path: "workStatusId" });

    const employees = employeesRaw
      .filter((employee) => employee.workStatusId.workStatus === "Probationary")
      .map((employee) => ({
        employeeId: employee.employeeId,
        fullName: `${employee.firstName} ${employee.lastName}`,
        position: employee.positionId.position,
        hireDate: utils.formatDate(employee.hireDate),
        probationEnd: utils.formatDate(
          utils.addDays(employee.hireDate, employee.daysOfProbation)
        ),
        remainingDays: utils.getDaysDifference(
          today,
          utils.addDays(employee.hireDate, employee.daysOfProbation)
        ),
      }));

    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees on probation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateEmployeeProbation = async (req, res) => {
  const { clientDB } = req;
  const { hireDate, fullName, probationEnd, employeeId, updatedBy, notes } =
    req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Employee = utils.getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const AuditLog = utils.getModel(
      companyDb,
      "AuditLog",
      "../models/auditLogs.js"
    );

    const days = utils.getDaysDifference(hireDate, probationEnd);

    const employee = await Employee.findOneAndUpdate(
      { employeeId },
      { daysOfProbation: days },
      { new: true }
    );

    if (!employee) {
      throw new Error("Employee not found.");
    }

    const auditLog = new AuditLog({
      action: `Updated probation period for employee ${fullName}`,
      user: updatedBy,
      date: new Date(),
      reason: notes,
    });

    await auditLog.save();

    res.json(employee);
  } catch (error) {
    console.error("Error updating employee probation:", error);
    res.status(400).json({ message: "Bad Request" });
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
  addEmployee,
  addEmployees,
  addSickLeaveRecord,
  addTimeOffRequest,
  createS3Folder,
  getAttendanceRecords,
  getAttendanceRecordsByDate,
  getEmployeeDetailsByEmployeeId,
  getEmployees,
  getSickLeaveData,
  getSickLeaveRecords,
  getTimeOffRequests,
  getTimeOffRequestsByEmployeeId,
  getUsers,
  removeEmployee,
  updateAllEmployeesAttendanceRecord,
  updateAttendanceRecord,
  updateEmployee,
  updateEmployee,
  updateSickLeaveRecord,
  getEmployeesOnProbation,
  updateEmployeeProbation,
  actionTimeOffRequest,
};
