const express = require("express");

const router = express.Router();

const { getAllFloor } = require("../controllers/floor/index");
const { getAllSlot } = require("../controllers/slot/index");
const { seatGrid } = require("../controllers/seat/index");
const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");
const { getAllPlans } = require("../controllers/plan/index");

router.get("/floors", auth, restrictTo("student"), getAllFloor);
router.get("/slots", auth, restrictTo("student"), getAllSlot);
router.get("/floor/:floorId/seat-grid", auth, restrictTo("student"), seatGrid);
router.get("/plans", auth, restrictTo("student"), getAllPlans);

module.exports = router;
