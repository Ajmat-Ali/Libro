const express = require("express");
const router = express.Router();

const {
  initiateBooking,
  getMyBookings,
  getOneMyBooking,
} = require("../controllers/studentBooking/index");
const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

router.post("/initiate", auth, restrictTo("student"), initiateBooking);
router.get("/", auth, restrictTo("student"), getMyBookings);
router.get("/:bookingId", auth, restrictTo("student"), getOneMyBooking);

module.exports = router;
