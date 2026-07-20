const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least ₹1"],
    },
    paymentMode: {
      type: String,
      required: [true, "Payment mode is required"],
      enum: {
        values: ["cash", "online"],
        message: "{VALUE} is not a valid payment mode",
      },
    },
    status: {
      type: String,
      required: [true, "Payment status is required"],
      enum: {
        values: ["pending", "paid"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "pending",
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    recordedAt: {
      type: Date,
      default: null,
    },

    razorpayOrderId: {
      type: String,
      default: null,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      default: null,
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxLength: [300, "Notes cannot exceed 300 characters"],
      default: null,
    },
  },
  { timestamps: true },
);

paymentSchema.index({ libraryId: 1, status: 1, paidAt: 1 });

paymentSchema.index({ studentId: 1, status: 1 });

paymentSchema.index({ razorpayOrderId: 1, unique: true });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
