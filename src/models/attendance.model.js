const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
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
    },
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: [true, "Time slot reference is required"],
    },
    date: {
      type: Date,
      required: [true, "Attendance date is required"],
    },
    entryTime: {
      type: Date,
      required: [true, "Entry time is required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["present"],
        message: "{VALUE} is not a valid attendance status",
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
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Marked by reference is required"],
    },
  },
  { timestamps: true },
);

// ── INDEXES ──────────────────────────────────────────────────────

attendanceSchema.index(
  { studentId: 1, bookingId: 1, date: 1 },
  { unique: true },
);

attendanceSchema.index({ libraryId: 1, date: 1 });

attendanceSchema.index({ studentId: 1, date: 1 });

attendanceSchema.index({ timeSlotId: 1, date: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
