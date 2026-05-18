const Attendance = require("../../models/attendance.model");
const Booking = require("../../models/booking.model");
const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");
const QRCode = require("../../models/qrCode.model");

const studentDashboard = async (req, res) => {
  try {
    // ------------------------- DAtes --------------------
    const now = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // ----------------------------- Run prallel query for get all data at once ------------
    const [activeBookings, attendanceToday, library] = await Promise.all([
      // All active bookings for this student
      Booking.find({
        studentId: req.user._id,
        status: "active",
        endDate: { $gte: now },
      })
        .populate("seatId", "seatLabel seatType")
        .populate("timeSlotId", "name startTimeDisplay endTimeDisplay")
        .sort({ endDate: 1 }),

      // Today's attendance records for this student
      Attendance.find({
        studentId: req.user._id,
        date: { $gte: todayStart, $lte: todayEnd },
      }).populate("timeSlotId", "name"),

      // Library info (for name, timings)
      Library.findOne({}, "name timings workingDays"),
    ]);

    // ------------- For each active booking → get payment status + QR info + days left ----------------
    const bookingDetails = await Promise.all(
      activeBookings.map(async (booking) => {
        const [payment, qrCode] = await Promise.all([
          Payment.findOne({ bookingId: booking._id }),
          QRCode.findOne({ bookingId: booking._id, status: "active" }),
        ]);

        // How many days left in this booking
        const daysLeft = Math.ceil(
          (new Date(booking.endDate) - now) / (1000 * 60 * 60 * 24),
        );

        // Did student come today for THIS booking's slot?
        const attendedToday = attendanceToday.some(
          (a) =>
            a.bookingId && a.bookingId.toString() === booking._id.toString(),
        );
        return {
          bookingId: booking._id,
          seat: booking.seatId
            ? `${booking.seatId.seatLabel} (${booking.seatId.seatType})`
            : "N/A",
          slot: booking.timeSlotId
            ? {
                name: booking.timeSlotId.name,
                time: `${booking.timeSlotId.startTimeDisplay} - ${booking.timeSlotId.endTimeDisplay}`,
              }
            : null,
          startDate: booking.startDate,
          endDate: booking.endDate,
          daysLeft: daysLeft > 0 ? daysLeft : 0,
          // Alert if expiring soon
          expiringSoon: daysLeft <= 7,
          payment: {
            status: payment ? payment.status : "not_found",
            amount: payment ? payment.amount : 0,
            mode: payment ? payment.paymentMode : "N/A",
          },
          qr: qrCode
            ? {
                qrId: qrCode._id,
                expiresAt: qrCode.expiresAt,
              }
            : null,
          attendedToday,
        };
      }),
    );

    // ----------------------------- Return -----------------
    return res.status(200).json({
      library: library
        ? { name: library.name, timings: library.timings }
        : null,

      summary: {
        totalActiveBookings: activeBookings.length,
        attendedToday: attendanceToday.length,
      },
      bookings: bookingDetails,
    });
  } catch (error) {
    console.error("getStudentDashboard error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = studentDashboard;
