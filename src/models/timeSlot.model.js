const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
  {
    // ─── Library Reference ────────────────────────────────────────────────────
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },

    // ─── Slot Name ────────────────────────────────────────────────────────────
    // Freely decided by owner
    // e.g. "Morning", "Evening", "Night Shift", "24 Hours"
    name: {
      type: String,
      required: [true, "Slot name is required"],
      trim: true,
      minLength: [2, "Slot name must be at least 2 characters"],
      maxLength: [50, "Slot name cannot exceed 50 characters"],
    },

    // ─── Time Storage (Minutes From Midnight) ─────────────────────────────────
    // WHY minutes?
    // → Easy comparison (simple number comparison)
    // → Handles midnight crossing naturally
    // → No AM/PM confusion in backend logic
    //
    // HOW it works:
    // Owner enters    → "10:00 PM" to "5:00 AM" (natural on frontend)
    // Frontend converts → startTimeMinutes: 1320
    //                     endTimeMinutes: 1740 (300 + 1440)
    // Backend stores  → minutes for comparison
    // Frontend shows  → converts back to AM/PM for display
    //
    // Midnight crossing detection (NO separate flag needed):
    // endTimeMinutes > 1439 → crosses midnight ✅ auto detected
    // e.g. 10PM to 5AM → endTimeMinutes: 1740 > 1439 → crosses midnight
    // e.g. 1AM  to 5AM → endTimeMinutes: 300  ≤ 1439 → same day
    //
    // IMPORTANT — Slot must fit within library window:
    // startTimeMinutes >= library.timings.openingTimeMinutes
    // endTimeMinutes   <= library.timings.closingTimeMinutes
    // This validation happens in CONTROLLER — not here
    // Schema cannot access other documents
    startTimeMinutes: {
      type: Number,
      required: [true, "Start time is required"],
      min: [0, "Start time cannot be negative"],
      max: [1439, "Start time cannot exceed 11:59 PM (1439 minutes)"],
      // 0    = 12:00 AM midnight
      // 360  = 6:00 AM
      // 720  = 12:00 PM
      // 1320 = 10:00 PM
      // 1439 = 11:59 PM (latest possible start)
    },

    endTimeMinutes: {
      type: Number,
      required: [true, "End time is required"],
      min: [1, "End time cannot be zero"],
      // NO max here → controller validates against library closing time
      // Schema cannot know library closing time
      // e.g. library closes 5AM → controller rejects anything above 1740
      // Different libraries have different closing times
    },

    // ─── Duration ─────────────────────────────────────────────────────────────
    // Auto calculated in controller → endTimeMinutes - startTimeMinutes
    // NEVER entered manually by owner
    // Stored for quick access in:
    // → Plan pricing (price based on duration)
    // → Reports (how many hours per slot)
    // → Display (show "6 hour slot" to student)
    // e.g. 6AM to 12PM → 720 - 360 = 360 minutes = 6 hours
    durationMinutes: {
      type: Number,
      required: [true, "Duration is required"],
      min: [30, "Slot duration must be at least 30 minutes"],
      // Minimum 30 minutes → practical minimum for any library slot
    },

    // ─── Display Strings ──────────────────────────────────────────────────────
    // Stored to avoid converting minutes back to AM/PM on every request
    // Frontend generates these before sending to backend
    // Backend stores as-is → sends to frontend as-is
    startTimeDisplay: {
      type: String,
      required: [true, "Start time display is required"],
      trim: true,
      // e.g. "6:00 AM", "10:00 PM"
    },

    endTimeDisplay: {
      type: String,
      required: [true, "End time display is required"],
      trim: true,
      // e.g. "12:00 PM", "5:00 AM (next day)"
      // Frontend adds "(next day)" when endTimeMinutes > 1439
    },

    // ─── Slot Status ──────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
      // true  → slot available for new bookings
      // false → slot hidden, no new bookings allowed
      //         existing bookings on this slot are NOT affected
    },

    // ─── Status Audit Trail ───────────────────────────────────────────────────
    // Tracks who changed slot status and when
    // Only filled when owner enables/disables slot
    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // Points to owner's User document
    },

    statusUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// ─── Compound Unique Index ────────────────────────────────────────────────────
// Same start + end combination cannot exist twice in same library
// Prevents exact duplicate slots
// Library A → 6AM to 12PM ✅
// Library A → 6AM to 12PM again ❌ blocked
// Library B → 6AM to 12PM ✅ (different library — allowed)
timeSlotSchema.index(
  { libraryId: 1, startTimeMinutes: 1, endTimeMinutes: 1 },
  { unique: true },
);

const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);
module.exports = TimeSlot;
