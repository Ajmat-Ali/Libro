const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
      required: [true, "Floor reference is required"],
    },

    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },

    seatLabel: {
      type: String,
      required: [true, "Seat label is required"],
      trim: true,
      uppercase: true,
      maxLength: [10, "Seat label cannot exceed 10 characters"],
      validate: {
        validator: function (value) {
          return /^[A-Z0-9]+$/.test(value);
        },
        message:
          "Seat label must contain only letters and numbers (e.g. A1, B12)",
      },
    },

    seatType: {
      type: String,
      required: [true, "Seat type is required"],
      enum: {
        values: ["general", "vip", "window", "cabin"],
        message: "{VALUE} is not a valid seat type",
      },
      default: "general",
    },

    status: {
      type: String,
      required: [true, "Seat status is required"],
      enum: {
        values: ["active", "maintenance", "reserved", "disabled"],
        message: "{VALUE} is not a valid seat status",
      },
      default: "active",
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

    statusReason: {
      type: String,
      trim: true,
      maxLength: [200, "Reason cannot exceed 200 characters"],
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxLength: [200, "Description cannot exceed 200 characters"],
      default: null,
    },
  },
  { timestamps: true },
);

seatSchema.index({ floorId: 1, seatLabel: 1 }, { unique: true });

const Seat = mongoose.model("Seat", seatSchema);
module.exports = Seat;
