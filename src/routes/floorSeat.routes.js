const express = require("express");

const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

// ----------------------------------- Floor API controller and routes -----------------
const {
  createFloor,
  getAllFloor,
  getOneFloor,
  updateFloor,
  toggleFloorStatus,
  deleteFloor,
} = require("../controllers/floor/index");

router.post("/", auth, restrictTo("owner"), createFloor);
router.get("/", auth, restrictTo("owner"), getAllFloor);
router.get("/:floorId", auth, restrictTo("owner"), getOneFloor);
router.patch("/:floorId", auth, restrictTo("owner"), updateFloor);
router.patch(
  "/:floorId/toggle-status",
  auth,
  restrictTo("owner"),
  toggleFloorStatus,
);
router.delete("/:floorId", auth, restrictTo("owner"), deleteFloor);

// ------------------------------------- Seat APi controller and routes ---------------

const {
  createSeat,
  bulkCreateSeat,
  getAllSeats,
  getOneSeat,
  updateSeat,
  updateSeatStatus,
  deleteSeat,
  seatGrid,
} = require("../controllers/seat/index");

router.post("/:floorId/seats/bulk", auth, restrictTo("owner"), bulkCreateSeat);
router.post("/:floorId/seats", auth, restrictTo("owner"), createSeat);
router.get("/:floorId/seats", auth, restrictTo("owner"), getAllSeats);
router.get("/:floorId/seats/:seatId", auth, restrictTo("owner"), getOneSeat);
router.patch(
  "/:floorId/seats/:seatId/status",
  auth,
  restrictTo("owner"),
  updateSeatStatus,
);
router.patch("/:floorId/seats/:seatId", auth, restrictTo("owner"), updateSeat);
router.delete("/:floorId/seats/:seatId", auth, restrictTo("owner"), deleteSeat);
router.get("/:floorId/seat-grid", auth, restrictTo("owner"), seatGrid);

module.exports = router;
