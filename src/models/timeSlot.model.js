const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },

    name: {
      type: String,
      required: [true, "Slot name is required"],
      trim: true,
      minLength: [2, "Slot name must be at least 2 characters"],
      maxLength: [50, "Slot name cannot exceed 50 characters"],
    },

    startTimeMinutes: {
      type: Number,
      required: [true, "Start time is required"],
      min: [0, "Start time cannot be negative"],
      max: [1439, "Start time cannot exceed 11:59 PM (1439 minutes)"],
    },

    endTimeMinutes: {
      type: Number,
      required: [true, "End time is required"],
      min: [1, "End time cannot be zero"],
    },

    durationMinutes: {
      type: Number,
      required: [true, "Duration is required"],
      min: [30, "Slot duration must be at least 30 minutes"],
      // Minimum 30 minutes → practical minimum for any library slot
    },

    startTimeDisplay: {
      type: String,
      required: [true, "Start time display is required"],
      trim: true,
    },

    endTimeDisplay: {
      type: String,
      required: [true, "End time display is required"],
      trim: true,
    },

    // ─── Slot Status ──────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    statusUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

timeSlotSchema.index(
  { libraryId: 1, startTimeMinutes: 1, endTimeMinutes: 1 },
  { unique: true },
);

const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);
module.exports = TimeSlot;
