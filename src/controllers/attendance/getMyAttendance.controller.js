const Attendance = require("../../models/attendance.model");
const Booking = require("../../models/booking.model");
const Library = require("../../models/library.model");

const getMyAttendance = async (req, res) => {
  try {
    // -------------------- Get month and year from query (default = current month) -------------
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    // ----------------------- Start and end of requested month --------------------------
    const startOfMonth = new Date(year, month - 1, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(year, month, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // ----------------------- Find all attendance records for this student this month ------------------
    const records = await Attendance.find({
      studentId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate("timeSlotId", "name startTimeDisplay endTimeDisplay")
      .sort({ date: 1 });

    // -----------------------  Find student's active bookings this month -----------------
    const activeBookings = await Booking.find({
      studentId: req.user._id,
      status: "active",
      startDate: { $lte: endOfMonth },
      endDate: { $gte: startOfMonth },
    });

    // ----------------------- Get library holidays for this month -------------
    const library = await Library.findOne({});

    const holidaysThisMonth = library
      ? library.holidays.filter((h) => {
          const hDay = new Date(h.date);
          return hDay >= startOfMonth && hDay <= endOfMonth;
        })
      : [];

    // ----------------------- Build set of holiday dates for quick lookup ---------------
    const holidayDates = new Set(
      holidaysThisMonth.map(
        (h) => new Date(h.date).toISOString().split("T")[0],
      ),
    );

    // -------------------- Build calendar data ----------------------------------
    //  For each day of month → present / absent / holiday / no-booking
    const calendarData = {};
    const totalDaysInMonth = endOfMonth.getDate();

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateKey = currentDate.toISOString().split("T")[0]; // "2026-05-01"

      // Skip future dates
      if (currentDate > now) {
        calendarData[dateKey] = "future";
        continue;
      }

      // Check if it's a holiday
      if (holidayDates.has(dateKey)) {
        calendarData[dateKey] = "holiday";
        continue;
      }

      // Check if student had an active booking on this date
      const hadBooking = activeBookings.some((b) => {
        return (
          new Date(b.startDate) <= currentDate &&
          new Date(b.endDate) >= currentDate
        );
      });

      if (!hadBooking) {
        // No booking on this date → not applicable
        calendarData[dateKey] = "no_booking";
        continue;
      }

      // Check attendance
      const wasPresent = records.some((r) => {
        const recordDate = new Date(r.date).toISOString().split("T")[0];
        return recordDate === dateKey;
      });

      calendarData[dateKey] = wasPresent ? "present" : "absent";
    }

    // ---------------------------- Monthly summary counts --------------------
    const presentDays = Object.values(calendarData).filter(
      (v) => v === "present",
    ).length;
    const absentDays = Object.values(calendarData).filter(
      (v) => v === "absent",
    ).length;
    const holidayDaysCount = Object.values(calendarData).filter(
      (v) => v === "holiday",
    ).length;

    // ----------------------- Success message ----------------------
    return res.status(200).json({
      month,
      year,
      summary: {
        present: presentDays,
        absent: absentDays,
        holidays: holidayDaysCount,
        attendancePercentage:
          presentDays + absentDays > 0
            ? Math.round((presentDays / (presentDays + absentDays)) * 100)
            : 0,
      },
      calendar: calendarData,
      records,
    });
  } catch (error) {
    console.error("getMyAttendance error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getMyAttendance;
