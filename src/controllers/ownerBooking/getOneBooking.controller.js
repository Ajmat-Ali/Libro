const Booking = require("../../models/booking.model");
const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");

const getOneBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // -------------------- 1 Get Library ------------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ---------------------- 2 Get Booking details ------------------------
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      libraryId: library._id,
    })
      .populate("studentId", "firstName lastName email phone")
      .populate("seatId", "seatLabel seatType")
      .populate("timeSlotId", "name startTimeDisplay endTimeDisplay")
      .populate("planId", "name calculatedPrice");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // ------------------------ 3 Fetch payment info -------------------
    const payment = await Payment.findOne({ bookingId: booking._id });

    // ----------------------- 4 Success message ---------------------
    return res.status(200).json({ booking, payment });
  } catch (error) {
    console.error("getOneBooking error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOneBooking;
