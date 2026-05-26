const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG and PNG images are allowed"), false);
    }

    cb(null, true);
  },
});

const uploadSingle = upload.single("logo");

module.exports = { uploadSingle };
