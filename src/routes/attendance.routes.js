const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

const {
  getDailyReport,
  getAbsentees,
  getStudentAttendance,
  markManualAttendance,
  deleteAttendance,
  getMyAttendance,
} = require("../controllers/attendance/index");

router.get(
  "/owner/attendance/daily",
  auth,
  restrictTo("owner"),
  getDailyReport,
);
router.get(
  "/owner/attendance/absentees",
  auth,
  restrictTo("owner"),
  getAbsentees,
);
router.get(
  "/owner/attendance/student/:studentId",
  auth,
  restrictTo("owner"),
  getStudentAttendance,
);
router.post(
  "/owner/attendance/manual",
  auth,
  restrictTo("owner"),
  markManualAttendance,
);
router.delete(
  "/owner/attendance/:attendanceId",
  auth,
  restrictTo("owner"),
  deleteAttendance,
);

///////////// Student Routes -----------------
router.get(
  "/student/my-attendance",
  auth,
  restrictTo("student"),
  getMyAttendance,
);

module.exports = router;
