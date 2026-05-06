const mongoose = require("mongoose");

const entryLogSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Library reference is required"],
      // Always stored — even for failed scans
      // Guard belongs to a library → we always know which library
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Guard reference is required"],
      // Always stored — guard is logged in, we always know who scanned
    },
    rawToken: {
      type: String,
      required: [true, "Raw token is required"],
      trim: true,
      // Always stored — exact string that came from QR scan
      // Critical for failed scans — no qrCodeId available
      // Helps detect: typos, fake QRs, tampered QRs
      // e.g. "abc-123-xyz" or "some-fake-string-someone-tried"
    },
    scanResult: {
      type: String,
      required: [true, "Scan result is required"],
      enum: {
        values: ["success", "failed"],
        message: "{VALUE} is not a valid scan result",
      },
      // success → QR valid, student entry allowed, attendance marked
      // failed  → any problem (invalid/expired/revoked/suspended)
    },
    failReason: {
      type: String,
      trim: true,
      default: null,
      enum: {
        values: [
          "invalid_token", // token not found in DB
          "qr_expired", // expiresAt passed
          "qr_revoked", // booking cancelled / student suspended
          "student_suspended", // isActive = false on User
          null, // null when scanResult = "success"
        ],
        message: "{VALUE} is not a valid fail reason",
      },
      // System generated — not free text
      // Enum keeps it consistent across all logs
    },
    scanTime: {
      type: Date,
      required: [true, "Scan time is required"],
      default: Date.now,
      // Exact timestamp of scan event
      // Separate from createdAt for semantic clarity
      // createdAt = when document was saved to DB
      // scanTime  = when guard physically scanned (should be same
      //             but explicit is better than implicit)
    },

    // ── FILLED ONLY ON SUCCESS ────────────────────────────────────
    // All null for failed scans
    qrCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRCode",
      default: null,
      // null → token not found in DB (invalid_token)
      // filled → valid token, QR document found
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // null → invalid token scan (no student to link)
      // filled → valid scan, student identified
      // Denormalized — owner views "entry logs per student" often
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      // null → invalid token scan
      // filled → valid scan, booking identified
    },
  },
  { timestamps: true },
);

// ── INDEXES ──────────────────────────────────────────────────────

// Owner views entry logs for their library filtered by date
// Most common query on this collection
entryLogSchema.index({ libraryId: 1, scanTime: -1 });
// -1 = descending → latest logs first (most useful for owner)

// Owner checks entry history of specific student
entryLogSchema.index({ studentId: 1, scanTime: -1 });

// Security check — all failed scans for a library
// e.g. "show me all fake QR attempts today"
entryLogSchema.index({ libraryId: 1, scanResult: 1, scanTime: -1 });

// Guard activity log — who scanned how many times
entryLogSchema.index({ scannedBy: 1, scanTime: -1 });

const EntryLog = mongoose.model("EntryLog", entryLogSchema);
module.exports = EntryLog;
