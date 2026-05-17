const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

const {
  getOwnerDashboard,
  getMembersReport,
} = require("../controllers/dashboard/index");

router.get("/owner/dashboard", auth, restrictTo("owner"), getOwnerDashboard);
router.get(
  "/owner/reports/members",
  auth,
  restrictTo("owner"),
  getMembersReport,
);

module.exports = router;
