const multer = require("multer");
const path = require("path");

const jsonFilter = (req, file, cb) => {
  if (file.mimetype.includes("json")) {
    cb(null, true);
  } else {
    cb("Please upload only json file.", false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../tmp"));
  },
  filename: (req, file, cb) => {
    cb(null, `tc-${req.params.testcaseId}-${file.originalname}`);
  }
});

module.exports = multer({ storage: storage, fileFilter: jsonFilter });
