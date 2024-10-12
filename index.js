require("./services/instrument");
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Sentry = require("@sentry/node");

dotenv.config();

const app = express();
const port = 5001;

Sentry.setupExpressErrorHandler(app);

mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "HRIS",
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("Database not connected", err));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", require("./routes/AuthRoutes"));
app.use("/administration", require("./routes/AdministrationRoutes"));
app.use("/employee", require("./routes/EmployeeRoutes"));
app.use("/client", require("./routes/ClientRoutes"));
app.use("/files", require("./routes/FileRoutes"));
app.use("/payroll", require("./routes/PayrollRoutes"));

require("./jobs/attendanceJob");

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.json({ error: res.sentry });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
