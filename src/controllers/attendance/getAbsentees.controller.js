const Attendance = require("../../models/attendance.model");
const Booking = require("../../models/booking.model");
const Library = require("../../models/library.model");

const getAbsentees = async (req, res) => {
  try {
    // ---------------- Get Library -------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // -------------------------- Get Booking ---------------------
    const activeBookings = await Booking.find({
      libraryId: library._id,
      status: "active",
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    }).populate("studentId", "firstName lastName phone");

    // -------------------- find Today's attendance ---------------------
    const todayAttendance = await Attendance.find({
      libraryId: library._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // ------------------------- Build set of bookingId -------------
    const presentBookingIds = new Set(
      todayAttendance.map((a) => a.bookingId.toString()),
    );

    // --------------  Filter Booking --------------------
    const getAbsentees = activeBookings
      .filter((booking) => {
        const bookingId = booking._id.toString();
        return !presentBookingIds.has(bookingId);
      })
      .map((booking) => {
        return {
          studentId: booking.studentId._id,
          name: `${booking.studentId.firstName} ${booking.studentId.lastName}`,
          phone: booking.studentId.phone,
          bookingId: booking._id,
        };
      });

    // ---------------- Return success message ---------------------
    return res.status(200).json({
      date: startOfDay,
      totalAbsent: getAbsentees.length,
      absentees: getAbsentees,
    });
  } catch (error) {
    console.error("getAbsentees error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getAbsentees;
