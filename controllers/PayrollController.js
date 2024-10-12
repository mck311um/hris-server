const mongoose = require("mongoose");
const Client = require("../models/client/client");
const utils = require("../utils/functions");

//Payroll Schedule
const getPayrollSchedules = async (req, res) => {
  const { clientDB } = req;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const PayrollSchedule = utils.getModel(
      companyDb,
      "PayrollSchedule",
      "../models/payroll/payrollSchedule.js"
    );

    const payrollSchedulesRaw = await PayrollSchedule.find();

    const payrollSchedules = payrollSchedulesRaw.map((schedule) => ({
      scheduleId: schedule._id,
      scheduleName: schedule.scheduleName,
      frequency: schedule.frequency,
      isActive: schedule.isActive,
      monthlyDay: schedule.monthlyDay,
      fortnightlyStartDate: schedule.fortnightlyStartDate,
      weeklyPayDay: schedule.weeklyPayDay,
    }));

    res.status(201).json(payrollSchedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const createPayrollSchedule = async (req, res) => {
  const { clientDB } = req;
  const {
    scheduleName,
    frequency,
    isActive,
    monthlyDay,
    fortnightlyStartDate,
    weeklyPayDay,
  } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const PayrollSchedule = utils.getModel(
      companyDb,
      "PayrollSchedule",
      "../models/payroll/payrollSchedule.js"
    );

    const PayrollRecord = utils.getModel(
      companyDb,
      "PayrollRecord",
      "../models/payroll/payrollRecord.js"
    );

    const payrollSchedule = new PayrollSchedule({
      scheduleName,
      frequency,
      isActive,
      monthlyDay,
      fortnightlyStartDate,
      weeklyPayDay,
    });

    await payrollSchedule.save();

    res.status(201);

    const today = new Date();
    const startYear = today.getFullYear();
    const numberOfYears = 3;

    if (frequency === "Monthly") {
      for (let year = startYear; year < startYear + numberOfYears; year++) {
        for (let month = 0; month < 12; month++) {
          const payrollNumber = (year - startYear) * 12 + month + 1;
          const payDate = new Date(year, month, monthlyDay);
          const payrollStartDate = new Date(year, month, monthlyDay);
          const payrollEndDate = new Date(year, month + 1, monthlyDay - 1);

          const payrollRecord = new PayrollRecord({
            payrollId: `${year}-${month + 1}`,
            payrollScheduleId: payrollSchedule._id,
            payrollStartDate,
            payrollEndDate,
            payDate,
            payrollNumber,
            isPaid: false,
          });

          await payrollRecord.save();
        }
      }
    }

    if (frequency === "Fortnightly") {
      let currentDate = new Date(fortnightlyStartDate);
      let payrollNumber = 1;

      while (currentDate.getFullYear() < startYear + numberOfYears) {
        const payrollStartDate = new Date(currentDate);
        const payrollEndDate = new Date(currentDate);
        payrollEndDate.setDate(payrollEndDate.getDate() + 13);

        const payDate = new Date(currentDate);

        const payrollRecord = new PayrollRecord({
          payrollId: `${payrollStartDate.getFullYear()}-FN-${payrollNumber}`,
          payrollScheduleId: payrollSchedule._id,
          payrollStartDate,
          payrollEndDate,
          payDate,
          payrollNumber,
          isPaid: false,
        });

        await payrollRecord.save();

        currentDate.setDate(currentDate.getDate() + 14);
        payrollNumber++;
      }
    }

    if (frequency === "Weekly") {
      let currentDate = new Date(today);
      let payrollNumber = 1;

      currentDate.setDate(
        currentDate.getDate() + (weeklyPayDay - currentDate.getDay())
      );

      while (currentDate.getFullYear() < startYear + numberOfYears) {
        const payrollStartDate = new Date(currentDate);
        const payrollEndDate = new Date(currentDate);
        payrollEndDate.setDate(payrollEndDate.getDate() + 6);

        const payDate = new Date(currentDate);

        const payrollRecord = new PayrollRecord({
          payrollId: `${payrollStartDate.getFullYear()}-W-${payrollNumber}`,
          payrollScheduleId: payrollSchedule._id,
          payrollStartDate,
          payrollEndDate,
          payDate,
          payrollNumber,
          isPaid: false,
        });

        await payrollRecord.save();

        currentDate.setDate(currentDate.getDate() + 7);
        payrollNumber++;
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//Allowances
const getAllowancesByEmployeeId = async (req, res) => {
  const { clientDB } = req;
  const { employeeId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const AllowanceRecord = utils.getModel(
      companyDb,
      "AllowanceRecord",
      "../models/payroll/allowanceRecord.js"
    );

    const EmployeeAllowance = utils.getModel(
      companyDb,
      "EmployeeAllowance",
      "../models/administration/allowance.js"
    );

    const allowancesRaw = await AllowanceRecord.find({ employeeId }).populate(
      "allowanceId"
    );

    const allowances = allowancesRaw.map((el) => ({
      allowanceRecordId: el._id,
      employeeId: el.employeeId,
      allowanceId: el.allowanceId._id,
      allowance: el.allowanceId.allowance,
      amount: el.amount,
      effectiveDate: utils.formatDate(el.effectiveDate),
      frequency:
        el.frequency === "# of Payroll(s)"
          ? `${el.numberOfPayrolls} Payrolls`
          : el.frequency === "Until Specific Date"
          ? `Until ${utils.formatDate(el.endDate)}`
          : el.frequency,
      endDate: utils.formatDate(el.endDate),
      notes: el.notes,
      numberOfPayrolls: el.numberOfPayrolls,
    }));

    res.status(201).json(allowances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//Create Records
const addAllowanceRecord = async (req, res) => {
  const { clientDB, clientCode } = req;
  const {
    allowanceId,
    amount,
    effectiveDate,
    frequency,
    endDate,
    notes,
    numberOfPayrolls,
    employeeId,
  } = req.body;

  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const client = await Client.findOne({ clientCode });

    const AllowanceRecord = utils.getModel(
      companyDb,
      "AllowanceRecord",
      "../models/payroll/allowanceRecord.js"
    );

    const allowanceRecord = new AllowanceRecord({
      allowanceId,
      amount,
      effectiveDate,
      frequency,
      endDate,
      notes,
      numberOfPayrolls,
      employeeId,
    });

    await allowanceRecord.save();
    res.status(201);

    createAllowancePayRecords(
      companyDb,
      amount,
      effectiveDate,
      frequency,
      endDate,
      numberOfPayrolls,
      employeeId,
      allowanceRecord
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const getEmployeePayDetails = async (req, res) => {
  const { clientDB, clientCode } = req;
  const { employeeId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);

    const client = await Client.findOne({ clientCode });

    const Employee = utils.getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const FInstitution = utils.getModel(
      companyDb,
      "FInstitution",
      "../models/administration/fInstitution.js"
    );

    const employeeDetailsRaw = await Employee.findOne({ employeeId }).populate(
      "fInstitutionId"
    );

    const payDetails = {
      fInstitution: employeeDetailsRaw.fInstitutionId.fInstitution,
      payRate: employeeDetailsRaw.payRate,
      accountNumber: employeeDetailsRaw.accountNumber,
      payType: employeeDetailsRaw.payType,
      schedule: client.payrollFrequency,
    };

    res.json(payDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployeePayDetails,
  addAllowanceRecord,
  createPayrollSchedule,
  getPayrollSchedules,
  getAllowancesByEmployeeId,
};

const createAllowancePayRecords = async (
  companyDb,
  amount,
  effectiveDate,
  frequency,
  endDate,
  numberOfPayrolls,
  employeeId,
  allowanceRecord
) => {
  console.log("Hit");
  const PayrollRecord = utils.getModel(
    companyDb,
    "PayrollRecord",
    "../models/payroll/payrollRecord.js"
  );

  const EmployeePayRecord = utils.getModel(
    companyDb,
    "EmployeePayRecord",
    "../models/payroll/empPayRecord.js"
  );

  const payrollRecordsAfterEffectiveDate = await PayrollRecord.find({
    payDate: { $gte: new Date(effectiveDate) },
    isPaid: false,
  }).sort({ payDate: 1 });

  if (frequency === "# of Payroll(s)") {
    let i = 0;
    while (i < numberOfPayrolls) {
      if (payrollRecordsAfterEffectiveDate.length > 0) {
        const payrollRecord = payrollRecordsAfterEffectiveDate[i];
        const employeePayRecord = new EmployeePayRecord({
          payrollId: payrollRecord.payrollId,
          payAmount: amount,
          payType: "ALLOWANCE",
          isPaid: true,
          employeeId,
          amount,
          payDate: payrollRecord.payDate,
          allowanceRecord: allowanceRecord._id,
        });
        await employeePayRecord.save();
        i++;
      }
    }
  }

  if (frequency === "Until Specific Date") {
    const payrollsWithInRange = await PayrollRecord.find({
      payDate: { $gte: new Date(effectiveDate), $lte: new Date(endDate) },
      isPaid: false,
    });
    let i = 0;
    while (i < payrollsWithInRange.length) {
      const payrollRecord = payrollsWithInRange[i];
      const employeePayRecord = new EmployeePayRecord({
        payrollId: payrollRecord.payrollId,
        payAmount: amount,
        payType: "ALLOWANCE",
        isPaid: true,
        employeeId,
        amount,
        payDate: payrollRecord.payDate,
        allowanceRecord: allowanceRecord._id,
      });
      await employeePayRecord.save();
      i++;
    }
  }
};
