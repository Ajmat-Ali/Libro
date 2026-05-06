const express = require("express");

const router = express.Router();

const {
  createGuard,
  getGuards,
  deactivateGuard,
} = require("../controllers/guard/index");

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

router.post("/guards", auth, restrictTo("owner"), createGuard);
router.get("/guards", auth, restrictTo("owner"), getGuards);
router.delete("/guards/:id", auth, restrictTo("owner"), deactivateGuard);

module.exports = router;
