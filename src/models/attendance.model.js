const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
      // Denormalized for daily attendance report queries
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      // Tells us which seat + which slot this attendance is for
      // No need to store seatId separately — get it from booking
    },
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: [true, "Time slot reference is required"],
      // Denormalized for slot-wise attendance filtering
      // e.g. "show me morning slot attendance for this week"
    },
    date: {
      type: Date,
      required: [true, "Attendance date is required"],
      // Date only — time part always set to 00:00:00 UTC in controller
      // e.g. 2024-04-25T00:00:00.000Z
      // Stored this way for clean date comparison queries
      // Never store as String — Date type allows range queries
    },
    entryTime: {
      type: Date,
      required: [true, "Entry time is required"],
      // Full timestamp of exact scan moment
      // e.g. 2024-04-25T06:45:23.000Z
      // Owner sees this → knows student arrived at 6:45 AM
      // Slot started at 6:00 AM → owner decides if acceptable
      // System stores fact, owner makes judgment
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["present"],
        message: "{VALUE} is not a valid attendance status",
        // Only "present" stored — record existing = present
        // No record for that date = absent (derived in controller)
        // This avoids cron jobs, pre-creation, complexity
      },
      default: "present",
    },
    markedHow: {
      type: String,
      required: [true, "Marked how is required"],
      enum: {
        values: ["qr_scan", "manual"],
        message: "{VALUE} is not a valid mark method",
      },
      // qr_scan → guard scanned QR (primary flow)
      // manual  → owner marked directly (backup option)
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Marked by reference is required"],
      // qr_scan → guardId who scanned
      // manual  → adminId who marked
    },
  },
  { timestamps: true },
);

// ── INDEXES ──────────────────────────────────────────────────────

// Most critical — prevent duplicate attendance
// Same student cannot be marked present twice
// for same booking on same date
attendanceSchema.index(
  { studentId: 1, bookingId: 1, date: 1 },
  { unique: true },
  // studentId + bookingId + date = unique combination
  // Student A + Morning Booking + Apr 25 → only one record allowed
  // Student A + Evening Booking + Apr 25 → separate record (different bookingId)
);

// Daily attendance report for owner
// "Show all attendance for library X on date Y"
attendanceSchema.index({ libraryId: 1, date: 1 });

// Student attendance calendar
// "Show all attendance for student X this month"
attendanceSchema.index({ studentId: 1, date: 1 });

// Slot wise attendance filter
attendanceSchema.index({ timeSlotId: 1, date: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
