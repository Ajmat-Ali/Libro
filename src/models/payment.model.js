const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
      // Denormalized for revenue report queries
      // Avoids joining through booking every time
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      unique: true,
      // unique: true → one payment record per booking
      // No partial payments — full amount in one go
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
      // Denormalized for student payment history queries
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least ₹1"],
      // Snapshot of Booking.price at payment time
      // Never changes even if plan price changes later
    },
    paymentMode: {
      type: String,
      required: [true, "Payment mode is required"],
      enum: {
        values: ["cash", "online"],
        message: "{VALUE} is not a valid payment mode",
      },
      // cash   → admin records manually (walk-in)
      // online → Razorpay handles automatically
    },
    status: {
      type: String,
      required: [true, "Payment status is required"],
      enum: {
        values: ["pending", "paid"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "pending",
      // pending → payment not yet received/confirmed
      // paid    → confirmed (cash recorded by admin OR Razorpay confirmed)
    },

    // ── CASH PAYMENT FIELDS ──────────────────────────────────────
    // Only filled when paymentMode = "cash"
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // Admin who physically collected cash and marked paid
    },
    recordedAt: {
      type: Date,
      default: null,
      // When admin marked it as paid in the system
    },

    // ── ONLINE PAYMENT FIELDS (RAZORPAY) ─────────────────────────
    // Only filled when paymentMode = "online"
    razorpayOrderId: {
      type: String,
      default: null,
      trim: true,
      // Created by our backend when student initiates payment
      // Format: "order_XXXXXXXXXXXXXXXXXX"
      // Step 1 of Razorpay flow
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      trim: true,
      // Returned by Razorpay after student completes payment
      // Format: "pay_XXXXXXXXXXXXXXXXXX"
      // Step 2 of Razorpay flow
    },
    razorpaySignature: {
      type: String,
      default: null,
      trim: true,
      // HMAC signature sent by Razorpay
      // Our backend verifies this to confirm payment is genuine
      // Prevents fake payment confirmations
      // Step 3 of Razorpay flow — verification
    },
    paidAt: {
      type: Date,
      default: null,
      // For cash  → same as recordedAt
      // For online → timestamp when Razorpay confirmed payment
    },

    // ── OPTIONAL ────────────────────────────────────────────────
    notes: {
      type: String,
      trim: true,
      maxLength: [300, "Notes cannot exceed 300 characters"],
      default: null,
      // Admin can add optional note
      // e.g. "Student paid via GPay directly to owner's number"
    },
  },
  { timestamps: true },
);

// ── INDEXES ──────────────────────────────────────────────────────

// Revenue reports — all paid payments for a library in date range
paymentSchema.index({ libraryId: 1, status: 1, paidAt: 1 });

// Student payment history
paymentSchema.index({ studentId: 1, status: 1 });

// Razorpay order lookup — verify payment callback
paymentSchema.index({ razorpayOrderId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
