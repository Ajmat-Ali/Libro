const express = require("express");
const router = express.Router();

const {
  handleWebhook,
  recordCashPayment,
  getAllPayments,
  getOnePayment,
  getRevenueSummary,
} = require("../controllers/payment/index");

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

router.post("/webhook", handleWebhook);

router.use(auth, restrictTo("owner"));

router.get("/revenue-summary", getRevenueSummary);
router.get("/", getAllPayments);
router.post("/:paymentId/record-cash", recordCashPayment);
router.get("/:paymentId", getOnePayment);

module.exports = router;
