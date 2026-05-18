const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

const {
  getOwnerDashboard,
  getMembersReport,
  getOccupancyReport,
  getRevenueReport,
  getAttendanceReport,
  studentDashboard,
} = require("../controllers/dashboard/index");

// ---------------------------- Student Dashboard ----------------------------
router.get("/owner/dashboard", auth, restrictTo("owner"), getOwnerDashboard);
router.get(
  "/owner/reports/members",
  auth,
  restrictTo("owner"),
  getMembersReport,
);
router.get(
  "/owner/reports/occupancy",
  auth,
  restrictTo("owner"),
  getOccupancyReport,
);
router.get(
  "/owner/reports/revenue",
  auth,
  restrictTo("owner"),
  getRevenueReport,
);
router.get(
  "/owner/reports/attendance",
  auth,
  restrictTo("owner"),
  getAttendanceReport,
);

// ----------------------------- Student Dashboard --------------------
router.get("/student/dashboard", auth, restrictTo("student"), studentDashboard);

module.exports = router;
