const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema(
  {
    // ─── Library Reference ────────────────────────────────────────────────────
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },

    // ─── Floor Information ────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Floor name is required"],
      trim: true,
      minLength: [2, "Floor name must be at least 2 characters"],
      maxLength: [50, "Floor name cannot exceed 50 characters"],
      // e.g. "Ground Floor", "First Floor", "Basement"
    },

    number: {
      type: Number,
      required: [true, "Floor number is required"],
      min: [0, "Floor number cannot be negative"],
      // 0 = Ground Floor
      // 1 = First Floor
      // -1 = Basement → we use 0 as minimum
      // Reason → Indian libraries rarely have basement floors
    },

    // ─── Capacity Overview ────────────────────────────────────────────────────
    // NOTE: totalSeats is NOT manually entered by owner
    // It auto reflects count of seats added to this floor
    // Updated in controller every time a seat is added/removed
    // Stored here so dashboard can show capacity without
    // counting seats every time → performance optimization
    totalSeats: {
      type: Number,
      default: 0,
      min: [0, "Total seats cannot be negative"],
    },

    // ─── Description (Optional) ───────────────────────────────────────────────
    description: {
      type: String,
      trim: true,
      maxLength: [200, "Description cannot exceed 200 characters"],
      default: null,
      // e.g. "AC floor", "Silent zone", "Group study area"
    },

    // ─── Floor Status ─────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
      // false → entire floor is under maintenance
      // All seats on this floor become unavailable automatically
      // Checked in controller when student tries to book
    },
  },
  { timestamps: true },
);

// ─── Compound Unique Index ────────────────────────────────────────────────────
// Same floor number cannot exist twice in same library
// e.g. Library cannot have two "Floor 1"
// BUT different libraries CAN have same floor number
// floorNumber 1 in Library A ✅
// floorNumber 1 in Library B ✅
// floorNumber 1 twice in Library A ❌
floorSchema.index({ libraryId: 1, number: 1 }, { unique: true });

const Floor = mongoose.model("Floor", floorSchema);
module.exports = Floor;
