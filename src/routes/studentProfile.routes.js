const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");
const {
  getMyProfile,
  updateMyProfile,
  getMyPayments,
  downloadMyReceipt,
} = require("../controllers/studentProfile/index");

router.get("/profile", auth, restrictTo("student"), getMyProfile);
router.patch("/profile", auth, restrictTo("student"), updateMyProfile);

router.get("/payments", auth, restrictTo("student"), getMyPayments);
router.get(
  "/payments/:paymentId/receipt",
  auth,
  restrictTo("student"),
  downloadMyReceipt,
);

module.exports = router;
