const Library = require("../../models/library.model");
const Booking = require("../../models/booking.model");
const Attendance = require("../../models/attendance.model");

const getDailyReport = async (req, res) => {
  try {
    // --------------- Get Library ------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // -------------------- Decide Target DAte ----------------------------
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // -------------------- Find All active Booking For this library (We're expecting to come bcz of active) -----------------
    const activeBookings = await Booking.find({
      libraryId: library._id,
      status: "active",
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    })
      .populate("studentId", "firstName lastName phone")
      .populate("seatId", "seatLabel seatType")
      .populate("timeSlotId", "name startTimeDisplay endTimeDisplay");

    if (activeBookings.length === 0) {
      return res.status(200).json({
        message: "No active bookings for this date.",
        date: startOfDay,
        report: [],
      });
    }

    // -------------------- Find attendance record for this day --------------------

    const attendanceRecords = await Attendance.find({
      libraryId: library._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // -------------------- Lookup chain -------------------
    const attendanceMap = {};

    attendanceRecords.forEach((record) => {
      attendanceMap[record.bookingId.toString()] = record.entryTime;
    });

    // ---------------------------------- Build report --------------------------------
    const report = activeBookings.map((booking) => {
      const bookingId = booking._id.toString();
      const isPresent = attendanceMap.hasOwnProperty(bookingId);

      return {
        student: {
          id: booking.studentId._id,
          name: `${booking.studentId.firstName} ${booking.studentId.lastName}`,
          phone: booking.studentId.phone,
        },
        seat: booking.seatId
          ? `${booking.seatId.seatLabel} (${booking.seatId.seatType})`
          : "N/A",
        slot: booking.timeSlotId
          ? `${booking.timeSlotId.name} ${booking.timeSlotId.startTimeDisplay} - ${booking.timeSlotId.endTimeDisplay}`
          : "N/A",
        status: isPresent ? "present" : "absent",
        entryTime: isPresent ? attendanceMap[bookingId] : null,
      };
    });

    const presentList = report.filter((r) => r.status === "present");
    const absentList = report.filter((r) => r.status === "absent");

    // ----------------------------- Return success message ----------------------
    return res.status(200).json({
      date: startOfDay,
      summary: {
        total: report.length,
        present: presentList.length,
        absent: absentList.length,
      },
      report,
    });
  } catch (error) {
    console.error("getDailyReport error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getDailyReport;
