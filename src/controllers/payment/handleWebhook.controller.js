const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const razorpayInstance = require("../../config/razorpay");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

const Payment = require("../../models/payment.model");
const Booking = require("../../models/booking.model");
const QRCode = require("../../models/qrCode.model");

const handleWebhook = async (req, res) => {
  try {
    // ----------------- Get Razorpay Signature -----------------
    const webhookSignature = req.headers["x-razorpay-signature"];
    if (!webhookSignature) {
      console.error("No webhook signature found in headers");
      return res.status(400).json({ message: "Invalid request." });
    }
    if (!receivedSignature) {
      return res.status(400).json({ message: "No signature found." });
    }

    // ------------------- Verify signature -------------------------
    const isValidSignature = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );
    if (!isValidSignature) {
      console.error("Invalid webhook signature — possible fake request");
      return res.status(400).json({ message: "Invalid signature." });
    }

    //----------------- check even type -----------------------
    const eventType = req.body.event;

    if (eventType !== "payment.captured") {
      return res.status(200).json({ received: true });
    }

    // --------------------- Get payment details -------------------
    const paymentEntity = req.body.payload.payment.entity;
    const razorpayPaymentId = paymentEntity.id; // e.g. "pay_Xyz789"
    const razorpayOrderId = paymentEntity.order_id;

    // ----Check duplicate booking for one payment because of razor pay multiple call in network fails and other situation ------------
    const alreadyProcessed = await Payment.findOne({
      razorpayOrderId: razorpayOrderId,
      status: "paid",
    });
    if (alreadyProcessed) {
      console.log("Duplicate webhook ignored for order:", razorpayOrderId);
      return res.status(200).json({ received: true });
    }

    // ------------ Read Booking data from razorpay order Notes -----------------
    const razorpayOrder = await razorpayInstance.orders.fetch(razorpayOrderId);
    const notes = razorpayOrder.notes;
    const {
      studentId,
      libraryId,
      seatId,
      timeSlotId,
      planId,
      startDate,
      endDate,
      price,
    } = notes;

    if (!studentId || !seatId || !timeSlotId || !planId) {
      console.error(
        "Missing booking data in Razorpay order notes:",
        razorpayOrderId,
      );
      return res.status(200).json({ received: true });
    }

    // --------------------- Create Booking ------------------------
    const booking = await Booking.create({
      libraryId: libraryId,
      studentId: studentId,
      seatId: seatId,
      timeSlotId: timeSlotId,
      planId: planId,
      bookedBy: studentId,
      status: "active",
      price: parseFloat(price),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      approvedAt: new Date(),
    });

    // ------------------- Create Payment --------------------------
    await Payment.create({
      libraryId: libraryId,
      bookingId: booking._id,
      studentId: studentId,
      amount: parseFloat(price),
      paymentMode: "online",
      status: "paid",
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      paidAt: new Date(),
    });

    // ----------------------- Generate QRCode -------------------------------
    await QRCode.create({
      bookingId: booking._id,
      studentId: studentId,
      token: uuidv4(), // unique random token
      status: "active",
      expiresAt: new Date(endDate), // QR valid until booking ends
    });

    // ------------- return success message with 200 -------------------------
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("handleWebhook error:", error.message);
    return res.status(200).json({ received: true });
  }
};

module.exports = handleWebhook;

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
//////////////////////////// SKIP for NOW  ////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
