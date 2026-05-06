const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const qrCodeSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      unique: true,
      // unique: true → one QR per booking, no duplicates possible
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
      // Denormalized — at scan time we need student details instantly
      // Without this → scan → find QR → find Booking → find Student
      // With this    → scan → find QR → find Student (one less query)
    },
    token: {
      type: String,
      required: [true, "QR token is required"],
      unique: true,
      default: () => uuidv4(),
      // UUID v4 → random, unguessable, globally unique
      // This string IS what gets encoded into the QR image
      // QR image generated fresh from this token on every request
      // Even if someone knows bookingId → cannot fake QR without token
      // Format: "110e8400-e29b-41d4-a716-446655440000"
    },
    status: {
      type: String,
      required: [true, "QR status is required"],
      enum: {
        values: ["active", "expired", "revoked"],
        message: "{VALUE} is not a valid QR status",
      },
      default: "active",
      // active  → valid, guard scan shows GREEN
      // expired → booking endDate passed, shows RED automatically
      // revoked → manually killed (student suspended / booking cancelled)
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
      // Always = Booking.endDate
      // When this date passes → QR is expired → RED on scan
      // Checked at scan time in controller
      // No cron job needed — just compare expiresAt with Date.now()
    },

    // ── REVOKE TRAIL ─────────────────────────────────────────────
    // Only filled when status = "revoked"
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // Admin who triggered the revoke
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
      // booking_cancelled → admin cancelled the booking
      // student_suspended → admin suspended the student account
      // booking_rejected  → admin rejected (edge case — QR should not exist yet)
      // Enum here because revokeReason is system-generated, not free text
    },
  },
  { timestamps: true },
);

// ── INDEXES ──────────────────────────────────────────────────────

// Most critical index — guard scans token → this must be instant
qrCodeSchema.index({ token: 1 });

// Check QR validity by student (student dashboard — show their QR)
qrCodeSchema.index({ studentId: 1, status: 1 });

// Find all expired QRs (cleanup / audit)
qrCodeSchema.index({ status: 1, expiresAt: 1 });

const QRCode = mongoose.model("QRCode", qrCodeSchema);
module.exports = QRCode;
