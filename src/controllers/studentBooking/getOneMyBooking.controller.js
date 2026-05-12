const Booking = require("../../models/booking.model");
const Payment = require("../../models/payment.model");

const getOneMyBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // -------------- Get Booking detail ------------------------
    const booking = await Booking.findOne({
      _id: bookingId,
      studentId: req.user.id,
    })
      .populate("seatId", "seatLabel seatType")
      .populate("timeSlotId", "name startTimeDisplay endTimeDisplay")
      .populate("planId", "name calculatedPrice");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // -------------------------- Get Payment ------------------------
    const payment = await Payment.findOne({ bookingId: booking._id });

    return res.status(200).json({ booking, payment });
  } catch (error) {
    console.error("getOneMyBooking error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOneMyBooking;
