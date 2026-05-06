const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    // ─── References ───────────────────────────────────────────────────────────
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
      required: [true, "Floor reference is required"],
    },

    // Denormalized for performance
    // Avoids double DB query when fetching all seats of library
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },

    // ─── Seat Label ───────────────────────────────────────────────────────────
    seatLabel: {
      type: String,
      required: [true, "Seat label is required"],
      trim: true,
      uppercase: true,
      maxLength: [10, "Seat label cannot exceed 10 characters"],
      validate: {
        validator: function (value) {
          // Must be alphanumeric only
          // Valid   → "A1", "B12", "VIP1"
          // Invalid → "A 1", "A-1", "A@1"
          return /^[A-Z0-9]+$/.test(value);
        },
        message:
          "Seat label must contain only letters and numbers (e.g. A1, B12)",
      },
    },

    // ─── Seat Type ────────────────────────────────────────────────────────────
    // Used by Plan schema to determine pricing
    // General → standard seat
    // VIP     → premium seat
    // Window  → seat near window
    // Cabin   → private enclosed space
    seatType: {
      type: String,
      required: [true, "Seat type is required"],
      enum: {
        values: ["general", "vip", "window", "cabin"],
        message: "{VALUE} is not a valid seat type",
      },
      default: "general",
    },

    // ─── Seat Status ──────────────────────────────────────────────────────────
    // active      → physically fine, open for new bookings
    // maintenance → temporarily broken, existing bookings kept, new blocked
    // reserved    → owner holding it, new bookings blocked
    // disabled    → permanently removed, never shows in seat map
    status: {
      type: String,
      required: [true, "Seat status is required"],
      enum: {
        values: ["active", "maintenance", "reserved", "disabled"],
        message: "{VALUE} is not a valid seat status",
      },
      default: "active",
    },

    // ─── Status Audit Trail ───────────────────────────────────────────────────
    // Tracks who changed status, when and why
    // Important for owner accountability
    // Only filled when status changes to maintenance/reserved/disabled
    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    statusUpdatedAt: {
      type: Date,
      default: null,
    },

    statusReason: {
      type: String,
      trim: true,
      maxLength: [200, "Reason cannot exceed 200 characters"],
      default: null,
      // e.g. "Chair broken", "Reserved for VIP member"
    },

    // ─── Description (Optional) ───────────────────────────────────────────────
    description: {
      type: String,
      trim: true,
      maxLength: [200, "Description cannot exceed 200 characters"],
      default: null,
      // e.g. "Near window", "Corner seat", "Extra legroom"
    },
  },
  { timestamps: true },
);

// ─── Compound Unique Index ────────────────────────────────────────────────────

seatSchema.index({ floorId: 1, seatLabel: 1 }, { unique: true });

const Seat = mongoose.model("Seat", seatSchema);
module.exports = Seat;
