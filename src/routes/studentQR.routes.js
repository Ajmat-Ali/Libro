const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

const {
  getMyQRList,
  viewMyQR,
  downloadMyQRImage,
} = require("../controllers/studentQr/index");

router.use(auth, restrictTo("student"));

router.get("/", getMyQRList);
router.get("/:qrId/download", downloadMyQRImage);
router.get("/:qrId", viewMyQR);

module.exports = router;
