const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
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
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxLength: [300, "Rejection reason cannot exceed 300 characters"],
      default: null,
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
    },

    extendedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ seatId: 1, timeSlotId: 1, status: 1 });

bookingSchema.index({ libraryId: 1, status: 1 });

bookingSchema.index({ studentId: 1, status: 1 });

bookingSchema.index({ status: 1, endDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
