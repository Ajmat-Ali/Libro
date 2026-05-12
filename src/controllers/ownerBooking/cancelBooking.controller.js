const Booking = require("../../models/booking.model");
const Library = require("../../models/library.model");
const QRCode = require("../../models/qrCode.model");

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // ------------------- 1 Get Library ---------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ----------------- 2 Get booking ---------------------
    const booking = await Booking.findOne({
      _id: bookingId,
      libraryId: library._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.status !== "active") {
      return res.status(400).json({
        message: `Only active bookings can be cancelled. This booking is "${booking.status}".`,
      });
    }
    // ----------------- 3  Update booking ---------------------
    booking.status = "cancelled";
    booking.cancelledBy = req.user.id;
    booking.cancelledAt = new Date();
    booking.cancelReason = req.body.cancelReason
      ? req.body.cancelReason.toString().trim()
      : null;

    await booking.save();

    // ----------------- 4 Revoke QR code immediately ---------------------
    await QRCode.findOneAndUpdate(
      { bookingId: booking._id },
      {
        status: "revoked",
        revokedAt: new Date(),
        revokedBy: req.user.id,
        revokeReason: "booking_cancelled",
      },
    );

    // ----------------- 5 Success message ---------------------
    return res.status(200).json({
      message: "Booking cancelled and QR code revoked successfully.",
    });
  } catch (error) {
    console.error("cancelBooking error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = cancelBooking;
