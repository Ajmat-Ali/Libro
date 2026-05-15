const Library = require("../../models/library.model");
const QRCode = require("../../models/qrCode.model");

const getStudentQRList = async (req, res) => {
  try {
    const { memberId } = req.params;

    // ----------------- Get Library ------------------------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ----------------- Get QRCodes ---------------------------------
    const qrCodes = await QRCode.find({
      studentId: memberId,
      status: "active",
      expiresAt: { $gt: Date.now() },
    }).populate({
      path: "bookingId",
      populate: [
        { path: "seatId", select: "seatLabel seatType" },
        { path: "timeSlotId", select: "name startTimeDisplay endTimeDisplay" },
      ],
    });
    if (qrCodes.length === 0) {
      return res.status(404).json({
        message: "No active QR codes found for this student.",
      });
    }

    // ----------------- Extract specific field to send frontend -----------
    const qrList = qrCodes.map((qr) => {
      return {
        qrId: qr._id,
        expiresAt: qr.expiresAt,
        booking: {
          seat: qr.bookingId.seatId
            ? `${qr.bookingId.seatId.seatLabel} (${qr.bookingId.seatId.seatType})`
            : "N/A",
          slot: qr.bookingId.timeSlotId
            ? `${qr.bookingId.timeSlotId.name} — ${qr.bookingId.timeSlotId.startTimeDisplay} to ${qr.bookingId.timeSlotId.endTimeDisplay}`
            : "N/A",
        },
      };
    });

    // ----------------- Return success message ---------------------
    return res.status(200).json({
      count: qrCodes.length,
      qrCodes: qrList,
    });
  } catch (error) {
    console.error("getStudentQRList error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getStudentQRList;
