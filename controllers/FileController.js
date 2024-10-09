const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const mongoose = require("mongoose");
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

const listFilesInFolder = async (req, res, next) => {
  const { clientCode } = req;

  try {
    const params = {
      Bucket: awsBucketName,
      Prefix: `${clientCode}/`,
    };

    const command = new ListObjectsV2Command(params);
    const data = await s3.send(command);

    const items = data.Contents.map((content) => content.Key);

    res.status(200).json({
      items,
    });
  } catch (error) {
    console.error("Error listing items in folder:", error);
    res.status(500).json({ message: "Error fetching S3 folder contents" });
  }
};

const getProfilePicture = async (req, res) => {
  const { clientDB } = req;
  const { employeeId } = req.params;
  try {
    const companyDb = mongoose.connection.useDb(clientDB);
    const Employee = utils.getModel(
      companyDb,
      "Employee",
      "../models/employee/employee.js"
    );

    const employee = await Employee.findOne({
      employeeId: employeeId,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (!employee.profilePic) {
      return res.status(201).json({ message: "Profile picture not found" });
    }

    const params = {
      Bucket: awsBucketName,
      Key: employee.profilePic,
    };

    const command = new GetObjectCommand(params);
    const data = await s3.send(command);

    res.writeHead(200, {
      "Content-Type": "image/jpeg",
    });
    data.Body.pipe(res);
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).json({ message: "Error fetching profile picture" });
  }
};

const getEmployeeFolders = async (req, res) => {
  const { clientCode } = req;
  const { employeeId } = req.params;

  try {
    const params = {
      Bucket: awsBucketName,
      Prefix: `${clientCode}/Employees/${employeeId}/`,
      Delimiter: "/",
    };

    const command = new ListObjectsV2Command(params);
    const data = await s3.send(command);

    const folders = data.CommonPrefixes
      ? data.CommonPrefixes.map((prefix) => prefix.Prefix)
      : [];

    const files = data.Contents.filter(
      (content) => content.Key !== params.Prefix
    ).map((content) => content.Key);

    const folderCounts = [];

    for (const folder of folders) {
      const folderParams = {
        Bucket: awsBucketName,
        Prefix: folder,
        Delimiter: "/",
      };

      const folderCommand = new ListObjectsV2Command(folderParams);
      const folderData = await s3.send(folderCommand);

      const itemCount = folderData.Contents.filter(
        (content) => content.Key !== folder
      ).length;

      folderCounts.push({ folder: folder, itemCount });
    }

    res.status(200).json({
      folderCounts,
      files,
      path: `${clientCode}/Employees/${employeeId}/`,
    });
  } catch (error) {
    console.error("Error fetching employee files and folders:", error);
    res
      .status(500)
      .json({ message: "Error fetching employee files and folders" });
  }
};

const getFolderContents = async (req, res) => {
  const { path } = req.body;

  try {
    const params = {
      Bucket: awsBucketName,
      Prefix: path,
      Delimiter: "/",
    };

    const command = new ListObjectsV2Command(params);
    const data = await s3.send(command);

    const folders = data.CommonPrefixes
      ? data.CommonPrefixes.map((prefix) => prefix.Prefix)
      : [];

    const files = data.Contents.filter(
      (content) => content.Key !== params.Prefix
    ).map((content) => content.Key);

    const folderCounts = [];

    for (const folder of folders) {
      const folderParams = {
        Bucket: awsBucketName,
        Prefix: folder,
        Delimiter: "/",
      };

      const folderCommand = new ListObjectsV2Command(folderParams);
      const folderData = await s3.send(folderCommand);

      const itemCount = folderData.Contents.filter(
        (content) => content.Key !== folder
      ).length;

      folderCounts.push({ folder: folder, itemCount });
    }

    res.status(200).json({
      folderCounts,
      files,
    });
  } catch (error) {
    console.error("Error fetching folder contents:", error);
    res.status(500).json({ message: "Error fetching folder contents" });
  }
};

const uploadDocument = async (req, res) => {
  const { type, fileName, folderName, path, extension } = req.body;
  const file = req.file;

  try {
    if (type === "file") {
      if (!file) {
        return res.status(400).json({ message: "No file provided" });
      }

      console.log(file.mimetype);

      const params = {
        Bucket: awsBucketName,
        Key: `${path}${fileName}.${extension}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(params));

      res.status(200).json({ message: "Document uploaded successfully" });
    } else if (type === "folder") {
      const folderParams = {
        Bucket: awsBucketName,
        Key: `${path}${folderName}/`,
        Body: "",
      };

      await s3.send(new PutObjectCommand(folderParams));

      res.status(200).json({ message: "Folder created successfully" });
    }
  } catch (err) {
    console.error("Error uploading document:", err);
    res.status(500).json({ message: "Error uploading document" });
  }
};

const viewDocument = async (req, res) => {
  const { path } = req.body;

  console.log(path);

  try {
    const params = {
      Bucket: awsBucketName,
      Key: path,
    };

    const command = new GetObjectCommand(params);
    const data = await s3.send(command);

    res.writeHead(200, {
      "Content-Type": data.ContentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${path.split("/").pop()}"`,
    });

    data.Body.pipe(res)
      .on("error", (err) => {
        console.error("Stream error:", err);
        res.status(500).json({ message: "Error streaming document" });
      })
      .on("end", () => {
        res.end();
      });
  } catch (error) {
    console.error("Error viewing document:", error);
    res.status(500).json({ message: "Error viewing document" });
  }
};

module.exports = {
  listFilesInFolder,
  getProfilePicture,
  getEmployeeFolders,
  getFolderContents,
  uploadDocument,
  viewDocument,
};
