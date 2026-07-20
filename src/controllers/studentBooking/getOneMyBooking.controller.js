const Booking = require("../../models/booking.model");
const Payment = require("../../models/payment.model");
const QRCode = require("../../models/qrCode.model");

const getOneMyBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // -------------- Get Booking detail ------------------------
    const booking = await Booking.findOne({
      _id: bookingId,
      studentId: req.user._id,
    })
      .populate("seatId", "seatLabel seatType")
      .populate("timeSlotId", "name startTimeDisplay endTimeDisplay")
      .populate("planId", "name calculatedPrice")
      .populate("studentId", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // -------------------------- Get Payment ------------------------
    // const payment = await Payment.findOne({ bookingId: booking._id });

    const [payment, qr] = await Promise.all([
      Payment.findOne({ bookingId: booking._id }).lean(),
      QRCode.findOne({
        bookingId: booking._id,
        studentId: req.user._id,
      })
        .select("_id")
        .lean(),
    ]);

    return res.status(200).json({ booking, payment, qr });
  } catch (error) {
    console.error("getOneMyBooking error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOneMyBooking;
