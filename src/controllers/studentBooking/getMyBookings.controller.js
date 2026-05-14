const Booking = require("../../models/booking.model");

const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // ------------ Students only see their own bookings ---------------
    const filter = { studentId: req.user._id };
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);

    // ------------------------ GEt Booking details --------------------------
    const bookings = await Booking.find(filter)
      .populate("seatId", "seatLabel seatType")
      .populate("timeSlotId", "name startTimeDisplay endTimeDisplay")
      .populate("planId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // ------------------------ Success message -----------------
    return res.status(200).json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      bookings,
    });
  } catch (error) {
    console.error("getMyBookings error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getMyBookings;
