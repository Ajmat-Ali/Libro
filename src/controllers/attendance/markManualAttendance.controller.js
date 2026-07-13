const Attendance = require("../../models/attendance.model");
const Booking = require("../../models/booking.model");
const Library = require("../../models/library.model");

const markManualAttendance = async (req, res) => {
  try {
    // ----------------- Get Library -----------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------- Get Body date and extract ------------
    const { studentId, bookingId, date } = req.body;

    if (!studentId || !bookingId || !date) {
      return res.status(400).json({
        errors: {
          studentId: !studentId ? "Student is required" : undefined,
          bookingId: !bookingId ? "Booking is required" : undefined,
          date: !date ? "Date is required" : undefined,
        },
      });
    }

    // ------------------------- verify booking existance -----------
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const booking = await Booking.findOne({
      _id: bookingId,
      libraryId: library._id,
      studentId: studentId,
      status: "active",
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Active booking not found for this student.",
      });
    }

    // ------------------------- Check if attendance already exist -----------------
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      libraryId: library._id,
      bookingId: bookingId,
      date: attendanceDate,
    });
    if (existingAttendance) {
      return res.status(409).json({
        message: "Attendance already marked for this student on this date.",
        existingRecord: existingAttendance,
      });
    }

    // ------------------------- Create Attendance ------------------
    const attendance = await Attendance.create({
      libraryId: library._id,
      studentId: studentId,
      bookingId: bookingId,
      timeSlotId: booking.timeSlotId,
      date: attendanceDate,
      entryTime: new Date(),
      status: "present",
      markedHow: "manual",
      markedBy: req.user._id,
    });

    // ------------------------- Return success message ------------------
    return res.status(201).json({
      message: "Attendance marked manually.",
      attendance,
    });
  } catch (error) {
    console.error("markManualAttendance error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = markManualAttendance;
