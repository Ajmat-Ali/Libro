const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },

    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: [true, "Time slot reference is required"],
    },

    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      minLength: [2, "Plan name must be at least 2 characters"],
      maxLength: [100, "Plan name cannot exceed 100 characters"],
    },

    seatType: {
      type: String,
      required: [true, "Seat type is required"],
      enum: {
        values: ["general", "vip", "window", "cabin"],
        message: "{VALUE} is not a valid seat type",
      },
    },

    durationType: {
      type: String,
      required: [true, "Duration type is required"],
      enum: {
        values: ["monthly"],
        message: "{VALUE} is not a valid duration type",
      },
      default: "monthly",
    },

    calculatedPrice: {
      type: Number,
      required: [true, "Calculated price is required"],
      min: [1, "Calculated price must be at least ₹1"],
    },

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

planSchema.index(
  { libraryId: 1, timeSlotId: 1, seatType: 1 },
  { unique: true },
);

const Plan = mongoose.model("Plan", planSchema);
module.exports = Plan;
