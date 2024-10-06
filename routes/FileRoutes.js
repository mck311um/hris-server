const express = require("express");
const cors = require("cors");
const multer = require("multer");

const upload = multer();
const controller = require("../controllers/FileController");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.options("*", cors());
router.use(requireAuth);

//Fetch
router.get("/list", controller.listFilesInFolder);
router.get("/profilePic/:employeeId", controller.getProfilePicture);
router.get("/employeeFolders/:employeeId", controller.getEmployeeFolders);

//Post
router.post("/folderContents/", controller.getFolderContents);
router.post("/upload", upload.single("file"), controller.uploadDocument);
router.post("/view", controller.viewDocument);

module.exports = router;
