const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: {
        values: [
          "booking_approved",
          "booking_rejected",
          "booking_cancelled",
          "payment_due",
          "plan_expiring",
          "new_announcement",
        ],
        message: "{VALUE} is not a valid notification type",
      },
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxLength: [500, "Message cannot exceed 500 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedModel: {
      type: String,
      default: null,
      enum: {
        values: ["Booking", "Payment", "Announcement", null],
        message: "{VALUE} is not a valid related model",
      },
    },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

notificationSchema.index({ userId: 1, isRead: 1 });

notificationSchema.index({ libraryId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
