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
    res.json(employees);
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

const updateEmployee = async (req, res) => {};
const removeEmployee = async (req, res) => {};

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
  updateEmployee,
  removeEmployee,
};
