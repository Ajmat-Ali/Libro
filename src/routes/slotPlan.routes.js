const express = require("express");

const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

const {
  createSlot,
  getAllSlot,
  getOneSlot,
  updateSlot,
  toggleSlotStatus,
  deleteSlot,
} = require("../controllers/slot/index");

const {
  getAllPlans,
  getOnePlan,
  togglePlanStatus,
} = require("../controllers/plan/index");

// ------------------ Slot Routes --------------------------
router.post("/slots", auth, restrictTo("owner"), createSlot);
router.get("/slots", auth, restrictTo("owner"), getAllSlot);
router.get("/slots/:slotId", auth, restrictTo("owner"), getOneSlot);
router.patch("/slots/:slotId", auth, restrictTo("owner"), updateSlot);
router.patch(
  "/slots/:slotId/toggle-status",
  auth,
  restrictTo("owner"),
  toggleSlotStatus,
);
router.delete("/slots/:slotId", auth, restrictTo("owner"), deleteSlot);

// --------------------------- Plan Routes -----------------------------
router.get("/plans", auth, restrictTo("owner"), getAllPlans);
router.get("/plans/:planId", auth, restrictTo("owner"), getOnePlan);
router.patch(
  "/plans/:planId/toggle-status",
  auth,
  restrictTo("owner"),
  togglePlanStatus,
);

module.exports = router;
