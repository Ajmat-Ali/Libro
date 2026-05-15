const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

const {
  getStudentQRList,
  viewStudentQRImage,
  downloadStudentQRImage,
  getTodaySummary,
  getStudentEntryHistory,
  getAllEntryLogs,
} = require("../controllers/ownerQR/index");

router.use(auth, restrictTo("owner"));

router.get("/entry-logs/today-summary", getTodaySummary);
router.get("/entry-logs/student/:memberId", getStudentEntryHistory);
router.get("/entry-logs", getAllEntryLogs);
router.get("/members/:memberId/qr", getStudentQRList);
router.get("/members/:memberId/qr/:qrId/download", downloadStudentQRImage);
router.get("/members/:memberId/qr/:qrId", viewStudentQRImage);

module.exports = router;
