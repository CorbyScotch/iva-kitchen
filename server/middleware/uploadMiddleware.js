const multer = require("multer");

// Instead of saving files to disk OR routing them through a glue package,
// we store the file temporarily in RAM as raw data (a "buffer")
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;
