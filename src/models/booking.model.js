const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
      // Denormalized for performance
      // Avoids joining through seat → floor → library on every query
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: [true, "Seat reference is required"],
    },
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: [true, "Time slot reference is required"],
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: [true, "Plan reference is required"],
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Booked by reference is required"],
      // If bookedBy === studentId → student self-booked
      // If bookedBy !== studentId → admin booked on behalf
    },
    status: {
      type: String,
      required: [true, "Booking status is required"],
      enum: {
        values: ["pending", "active", "expired", "cancelled", "rejected"],
        message: "{VALUE} is not a valid booking status",
      },
      default: "pending",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      // Snapshot of Plan.calculatedPrice at the moment of booking
      // Future price changes NEVER affect this booking
      // Even if plan price changes tomorrow → this stays same
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      // Admin picks this:
      // → At booking creation time (when admin books on behalf)
      // → At approval time (when admin approves student request)
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      // NEVER entered manually
      // Auto calculated in controller → startDate + 30 days
    },

    // ── APPROVAL TRAIL ──────────────────────────────────────────
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // null when admin books directly (they are bookedBy, not approvedBy)
      // filled when admin approves a student's pending request
    },
    approvedAt: {
      type: Date,
      default: null,
    },

    // ── REJECTION TRAIL ─────────────────────────────────────────
    rejectionReason: {
      type: String,
      trim: true,
      maxLength: [300, "Rejection reason cannot exceed 300 characters"],
      default: null,
      // Required in CONTROLLER when status = "rejected"
      // Cannot enforce required here because it's only needed in one status
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },

    // ── CANCELLATION TRAIL ──────────────────────────────────────
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      trim: true,
      maxLength: [300, "Cancel reason cannot exceed 300 characters"],
      default: null,
      // Optional — admin may or may not write reason
    },

    // ── EXTENSION TRACKING ──────────────────────────────────────
    extendedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      // null → fresh booking (not an extension)
      // filled → this booking is a renewal/extension of that booking
      // Allows full chain: booking1 → booking2 → booking3
    },
  },
  { timestamps: true },
);

// ── INDEXES ───────────────────────────────────────────────────────

// Overlap detection at booking time
// "Does this seat already have an active/pending booking for this slot?"
// Most critical query in the system
bookingSchema.index({ seatId: 1, timeSlotId: 1, status: 1 });

// Admin dashboard — view all bookings of a library filtered by status
bookingSchema.index({ libraryId: 1, status: 1 });

// Student dashboard — find all bookings for a student
bookingSchema.index({ studentId: 1, status: 1 });

// Expiry check — find all active bookings where endDate has passed
// Used by cron job or checked at scan time
bookingSchema.index({ status: 1, endDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
