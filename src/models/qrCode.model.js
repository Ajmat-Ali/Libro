const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const qrCodeSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    token: {
      type: String,
      required: [true, "QR token is required"],
      unique: true,
      default: () => uuidv4(),
    },
    status: {
      type: String,
      required: [true, "QR status is required"],
      enum: {
        values: ["active", "expired", "revoked"],
        message: "{VALUE} is not a valid QR status",
      },
      default: "active",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    revokedAt: {
      type: Date,
      default: null,
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    revokeReason: {
      type: String,
      trim: true,
      default: null,
      enum: {
        values: [
          "booking_cancelled",
          "student_suspended",
          "booking_rejected",
          null,
        ],
        message: "{VALUE} is not a valid revoke reason",
      },
    },
  },
  { timestamps: true },
);

qrCodeSchema.index({ token: 1 });

qrCodeSchema.index({ studentId: 1, status: 1 });

qrCodeSchema.index({ status: 1, expiresAt: 1 });

const QRCode = mongoose.model("QRCode", qrCodeSchema);
module.exports = QRCode;
