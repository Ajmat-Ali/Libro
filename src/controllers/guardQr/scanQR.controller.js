const Booking = require("../../models/booking.model");
const EntryLog = require("../../models/entryLog.model");
const Library = require("../../models/library.model");
const QRCode = require("../../models/qrCode.model");
const User = require("../../models/user.model");
const Attendance = require("../../models/attendance.model");

const scanQR = async (req, res) => {
  try {
    // -------------------- GEt Library -----------------
    const library = await Library.findOne({});

    const rawToken = req.body.token;

    if (!rawToken || rawToken.trim() === "") {
      return res.status(400).json({ message: "Raw Token is required." });
    }

    // ------------------------ Create Entry log -------------------------
    const createLog = async (result, failReason = null, extraData = {}) => {
      try {
        await EntryLog.create({
          libraryId: library._id,
          scannedBy: req.user.id,
          rawToken: rawToken,
          scanResult: result,
          failReason: failReason,
          scanTime: new Date(),
          ...extraData,
        });
      } catch (logErr) {
        console.error("EntryLog creation failed:", logErr.message);
      }
    };

    // ----------------- Check token exist ---------------------

    const qrCode = await QRCode.findOne({ token: rawToken });

    if (!qrCode) {
      await createLog("failed", "invalid_token");

      return res.status(200).json({
        scanResult: "failed",
        color: "RED",
        reason: "Invalid QR code. This QR does not belong to this library.",
      });
    }

    // ---------------- Check Qr status active --------------------
    if (qrCode.status !== "active") {
      await createLog("failed", "qr_revoked", {
        qrCodeId: qrCode._id,
        studentId: qrCode.studentId,
        bookingId: qrCode.bookingId,
      });

      return res.status(200).json({
        scanResult: "failed",
        color: "RED",
        reason: "This QR code has been revoked. Please contact the library.",
      });
    }

    // ------------------------ Check is QR Expired ---------------
    const now = Date.now();
    if (qrCode.expiresAt < now) {
      qrCode.status = "expired";
      await qrCode.save();

      await createLog("failed", "qr_expired", {
        qrCodeId: qrCode._id,
        studentId: qrCode.studentId,
        bookingId: qrCode.bookingId,
      });

      return res.status(200).json({
        scanResult: "failed",
        color: "RED",
        reason: "QR code has expired. Membership needs renewal.",
        expiredOn: qrCode.expiresAt,
      });
    }

    // ------------------------- Check is Student Active ------------------
    const student = await User.findById(qrCode.studentId);

    if (!student || !student.isActive) {
      await createLog("failed", "student_suspended", {
        qrCodeId: qrCode._id,
        studentId: qrCode.studentId,
        bookingId: qrCode.bookingId,
      });

      return res.status(200).json({
        scanResult: "failed",
        color: "RED",
        reason: "Student account is suspended. Contact library owner.",
      });
    }

    // -------------------------  Check Booking ----------------
    const booking = await Booking.findById(qrCode.bookingId)
      .populate("seatId", "seatLabel seatType")
      .populate("timeSlotId", "name startTimeDisplay endTimeDisplay");

    // ---------- Auto mark attendance ---------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      await Attendance.create({
        libraryId: library._id,
        studentId: student._id,
        bookingId: qrCode.bookingId,
        timeSlotId: booking.timeSlotId._id,
        date: today,
        entryTime: new Date(), // exact scan timestamp
        status: "present",
        markedHow: "qr_scan",
        markedBy: req.user.id, // guard's ID
      });
    } catch (attendanceErr) {
      if (attendanceErr.code === 11000) {
        console.log("Duplicate scan — attendance already marked for today");
      } else {
        console.error("Attendance creation error:", attendanceErr.message);
      }
    }

    // -------------- Create log success ----------------------
    await createLog("success", null, {
      qrCodeId: qrCode._id,
      studentId: student._id,
      bookingId: qrCode.bookingId,
    });

    // --------------------------- Return success response -------------------
    return res.status(200).json({
      scanResult: "success",
      color: "GREEN",
      message: "Entry allowed.",
      student: {
        name: `${student.firstName} ${student.lastName}`,
        photo: student.photo || null, // show student photo to guard
      },
      booking: {
        seat: booking.seatId
          ? `${booking.seatId.seatLabel} (${booking.seatId.seatType})`
          : "N/A",
        slot: booking.timeSlotId
          ? `${booking.timeSlotId.name} ${booking.timeSlotId.startTimeDisplay} - ${booking.timeSlotId.endTimeDisplay}`
          : "N/A",
        validUntil: booking.endDate,
      },
      scannedAt: new Date(),
    });
  } catch (error) {
    console.error("scanQR error:", error.message);
    await createLog("failed", "invalid_token");

    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = scanQR;
