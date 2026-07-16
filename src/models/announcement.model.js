const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Posted by reference is required"],
    },
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      minLength: [3, "Title must be at least 3 characters"],
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Announcement message is required"],
      trim: true,
      minLength: [10, "Message must be at least 10 characters"],
      maxLength: [1000, "Message cannot exceed 1000 characters"],
    },
    priority: {
      type: String,
      enum: {
        values: ["normal", "important", "urgent"],
        message: "{VALUE} is not a valid priority",
      },
      default: "normal",
    },
    targetAudience: {
      type: String,
      enum: {
        values: ["all", "active_members", "defaulters"],
        message: "{VALUE} is not a valid target audience",
      },
      default: "all",
      // all            → every student sees it
      // active_members → only students with active booking
      // defaulters     → only students with pending payment
      // Controller filters who sees it based on this field
    },
    isActive: {
      type: Boolean,
      default: true,
      // false → announcement deleted/hidden
      // Soft delete — keep record, just hide from students
    },
    editedAt: {
      type: Date,
      default: null,
      // null  → never edited
      // filled → last edit timestamp
    },
  },
  { timestamps: true },
);

// ── INDEXES ──────────────────────────────────────────────────────

// Student dashboard — fetch active announcements for their library
// Most common query — latest first
announcementSchema.index({ libraryId: 1, isActive: 1, createdAt: -1 });

// Filter by priority — owner wants to see urgent ones first
announcementSchema.index({ libraryId: 1, priority: 1, isActive: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;
