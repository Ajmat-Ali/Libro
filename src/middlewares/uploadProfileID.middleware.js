// middleware/uploadMiddleware.js
const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "profilePic") {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Profile photo must be JPEG, PNG or WEBP"), false);
    }
  }

  // idProof — images OR pdf
  if (file.fieldname === "idProof") {
    const allowedTypes = ["image/jpeg", "image/png", "image/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("ID proof must be JPEG, PNG or PDF"), false);
    }
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadFields = (req, res, next) => {
  multerUpload.fields([
    { name: "profilePic", maxCount: 1 }, // field name + max files
    { name: "idProof", maxCount: 1 },
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new Error("File too large. Max 5MB allowed"));
      }
      return next(new Error(err.message));
    }
    if (err) return next(new Error(err.message));
    next();
  });
};

module.exports = { uploadFields };
