const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// Function to ensure destination folder exists
function ensureFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// Function to determine destination folder dynamically based on the field name
function getDestination(req, file, cb) {
  const fieldName = file.fieldname;
  const folderName =
    fieldName === "profilePic" ? "profilePics" : "productImages";
  const destination = `./public/assets/${folderName}/`;
  ensureFolderExists(destination);
  cb(null, destination);
}

// Set storage
const storage = multer.diskStorage({
  destination: getDestination,
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const fileName = path.basename(file.originalname);
    const filename = `${uniqueSuffix}-${fileName}`;
    cb(null, filename);
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed filetypes
  const filetypes = /jpeg|jpg|png/;
  // Check the extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check the MIME type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only!");
  }
}

const fileHandleMiddleware = multer({
  storage: storage,
  limits: { fileSize: 100000000000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Export the fileHandleMiddleware
module.exports = fileHandleMiddleware;