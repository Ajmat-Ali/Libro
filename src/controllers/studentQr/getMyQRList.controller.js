const QRCode = require("../../models/qrCode.model");

const getMyQRList = async (req, res) => {
  try {
    // ---------------- Find all active QR ----------------------
    const qrCodes = await QRCode.find({
      studentId: req.user._id,
      status: "active",
      expiresAt: { $gt: Date.now() },
    })
      .populate({
        path: "bookingId",
        populate: [
          { path: "seatId", select: "seatLabel seatType" },
          {
            path: "timeSlotId",
            select: "name startTimeDisplay endTimeDisplay",
          },
        ],
      })
      .sort({ createdAt: -1 });

    // --------------- Filter the filed to send frontend (Don't send sensitive data ) --------------

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
          startDate: qr.bookingId.startDate,
          endDate: qr.bookingId.endDate,
        },
      };
    });

    // -----------------creturn success message -----------------
    return res.status(200).json({
      message: "QR codes fetched successfully.",
      count: qrCodes.length,
      qrCodes: qrList,
    });

    if (qrCodes.length === 0) {
      return res.status(404).json({
        message:
          "No active QR codes found. You may not have an active booking.",
      });
    }
  } catch (error) {
    console.error("getMyQRList error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getMyQRList;
