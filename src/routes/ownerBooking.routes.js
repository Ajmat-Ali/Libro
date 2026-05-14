const express = require("express");

const router = express.Router();

const {
  createOwnerBooking,
  getAllBookings,
  getOneBooking,
  extendBooking,
  cancelBooking,
} = require("../controllers/ownerBooking/index");

const restrictTo = require("../middlewares/restrictTo.middleware");
const auth = require("../middlewares/auth.middleware");

router.post("/", auth, restrictTo("owner"), createOwnerBooking);
router.get("/", auth, restrictTo("owner"), getAllBookings);
router.get("/:bookingId", auth, restrictTo("owner"), getOneBooking);
router.patch("/:bookingId/extend", auth, restrictTo("owner"), extendBooking);
router.patch("/:bookingId/cancel", auth, restrictTo("owner"), cancelBooking);

module.exports = router;
