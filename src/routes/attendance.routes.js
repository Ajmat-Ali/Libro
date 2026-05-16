const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

const { getDailyReport } = require("../controllers/attendance/index");

router.get("/daily", auth, restrictTo("owner"), getDailyReport);

module.exports = router;
