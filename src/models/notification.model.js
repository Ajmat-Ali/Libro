const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
      // Denormalized — filter all notifications for a library
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      // Who receives this notification
      // Always a student in current system
      // Owner/Guard notifications → future improvement
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: {
        values: [
          "booking_approved", // admin approved student booking
          "booking_rejected", // admin rejected student booking
          "booking_cancelled", // admin cancelled active booking
          "payment_due", // payment not yet received
          "plan_expiring", // plan expiring in 7 days
          "new_announcement", // owner posted new announcement
        ],
        message: "{VALUE} is not a valid notification type",
      },
      // Type drives frontend icon + color
      // booking_approved  → green bell
      // booking_rejected  → red bell
      // booking_cancelled → red bell
      // payment_due       → yellow warning
      // plan_expiring     → orange clock
      // new_announcement  → blue megaphone
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
      // Short heading shown in notification list
      // e.g. "Booking Approved" / "Fee Due" / "Plan Expiring Soon"
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxLength: [500, "Message cannot exceed 500 characters"],
      // Full detail shown when notification opened
      // e.g. "Your booking for Seat A1, Morning Slot has been
      //        approved. Valid from Apr 25 to May 25."
    },
    isRead: {
      type: Boolean,
      default: false,
      // false → unread (shown as bold / highlighted in frontend)
      // true  → student opened/viewed it
      // Never deleted — history always preserved
    },
    readAt: {
      type: Date,
      default: null,
      // null   → not yet read
      // filled → exact moment student marked it read
    },

    // ── RELATED ENTITY ───────────────────────────────────────────
    // Optional link to the thing this notification is about
    // Allows frontend to navigate directly
    // e.g. tap notification → go to that booking / payment
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      // bookingId / paymentId / announcementId
      // null for generic notifications
    },
    relatedModel: {
      type: String,
      default: null,
      enum: {
        values: ["Booking", "Payment", "Announcement", null],
        message: "{VALUE} is not a valid related model",
      },
      // Tells frontend which collection relatedId points to
      // So it knows which page to navigate to on tap
    },
  },
  { timestamps: true },
);

// ── INDEXES ──────────────────────────────────────────────────────

// Student notification bell — fetch all unread notifications
// Most common query — latest first
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Mark all as read — update all unread for this user
notificationSchema.index({ userId: 1, isRead: 1 });

// Cleanup old notifications if needed later
notificationSchema.index({ libraryId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
