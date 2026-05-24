const Booking = require("../../models/booking.model");
const Library = require("../../models/library.model");
const User = require("../../models/user.model");

const getAllBookings = async (req, res) => {
  try {
    // ------------------ 1 Get Library --------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // --------------------- 2 Get all variable from Quesry params ----------------
    const {
      search,
      status,
      studentId,
      slotId,
      floorId,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // ------------------ 3 Build filter step by step ------------------
    const filter = { libraryId: library._id };

    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;
    if (slotId) filter.timeSlotId = slotId;

    if (floorId) {
      const seatsOnFloor = await Seat.find({
        floorId: floorId,
      }).select("_id");

      const seatIds = seatsOnFloor.map((s) => s._id);
      filter.seatId = { $in: seatIds };
    }

    const total = await Booking.countDocuments(filter);

    let studentIds = [];

    if (search && !filter.studentId) {
      const students = await User.find({
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      studentIds = students.map((s) => s._id);

      filter.studentId = { $in: studentIds };
    }

    // ------------------------------- 4 Get booking data ----------------------------
    let bookings = await Booking.find(filter)
      .populate("studentId", "firstName lastName email phone")
      .populate("seatId", "seatLabel seatType")
      .populate("timeSlotId", "name startTimeDisplay endTimeDisplay")
      .populate("planId", "name calculatedPrice")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // console.log(bookings);

    // -------------------- Search By Name and email -----------------

    // ------------------------------- 5 Success message ---------------------
    return res.status(200).json({
      message: "Bookings fetched successfully.",
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      bookings,
    });
    // ------------------------------- 3
  } catch (error) {
    console.error("getAllBookings error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getAllBookings;
