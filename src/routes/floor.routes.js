const express = require("express");

const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");
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

module.exports = router;
