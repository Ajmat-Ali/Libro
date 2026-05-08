const express = require("express");

const router = express.Router();

const {
  createGuard,
  getGuards,
  deactivateGuard,
} = require("../controllers/guard/index");

const {
  createLibrary,
  getLibrary,
  updateLibrary,
  uploadLogo,
  addHoliday,
  removeHoliday,
} = require("../controllers/library/index");

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");
const { uploadSingle } = require("../middlewares/upload.middleware");

// ---------------------------------- Guard -----------------------------------

router.post("/guards", auth, restrictTo("owner"), createGuard);
router.get("/guards", auth, restrictTo("owner"), getGuards);
router.delete("/guards/:id", auth, restrictTo("owner"), deactivateGuard);

// ---------------------------------- Library -----------------------------------

router.post("/library", auth, restrictTo("owner"), createLibrary);
router.get("/library", auth, restrictTo("owner"), getLibrary);
router.patch("/library", auth, restrictTo("owner"), updateLibrary);
router.patch(
  "/library/logo",
  auth,
  restrictTo("owner"),
  uploadSingle,
  uploadLogo,
);
router.post("/library/holidays", auth, restrictTo("owner"), addHoliday);
router.delete(
  "/library/holidays/:id",
  auth,
  restrictTo("owner"),
  removeHoliday,
);

module.exports = router;
