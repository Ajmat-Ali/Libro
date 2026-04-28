const mongoose = require("mongoose");

const entryLogSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Guard reference is required"],
    },
    rawToken: {
      type: String,
      required: [true, "Raw token is required"],
      trim: true,
    },
    scanResult: {
      type: String,
      required: [true, "Scan result is required"],
      enum: {
        values: ["success", "failed"],
        message: "{VALUE} is not a valid scan result",
      },
    },
    failReason: {
      type: String,
      trim: true,
      default: null,
      enum: {
        values: [
          "invalid_token",
          "qr_expired",
          "qr_revoked",
          "student_suspended",
          null,
        ],
        message: "{VALUE} is not a valid fail reason",
      },
    },
    scanTime: {
      type: Date,
      required: [true, "Scan time is required"],
      default: Date.now,
    },

    qrCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRCode",
      default: null,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true },
);

entryLogSchema.index({ libraryId: 1, scanTime: -1 });

entryLogSchema.index({ studentId: 1, scanTime: -1 });

entryLogSchema.index({ libraryId: 1, scanResult: 1, scanTime: -1 });

entryLogSchema.index({ scannedBy: 1, scanTime: -1 });

const EntryLog = mongoose.model("EntryLog", entryLogSchema);
module.exports = EntryLog;
