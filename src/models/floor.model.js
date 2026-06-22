const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },

    name: {
      type: String,
      required: [true, "Floor name is required"],
      trim: true,
      minLength: [2, "Floor name must be at least 2 characters"],
      maxLength: [50, "Floor name cannot exceed 50 characters"],
    },

    number: {
      type: Number,
      required: [true, "Floor number is required"],
      min: [0, "Floor number cannot be negative"],
    },

    totalSeats: {
      type: Number,
      default: 0,
      min: [0, "Total seats cannot be negative"],
    },

    description: {
      type: String,
      trim: true,
      maxLength: [200, "Description cannot exceed 200 characters"],
      default: null,
      // e.g. "AC floor", "Silent zone", "Group study area"
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

floorSchema.index({ libraryId: 1, number: 1 }, { unique: true });

const Floor = mongoose.model("Floor", floorSchema);
module.exports = Floor;
