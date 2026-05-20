const Attendance = require("../../models/attendance.model");
const Booking = require("../../models/booking.model");
const EntryLog = require("../../models/entryLog.model");
const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");
const Seat = require("../../models/seat.model");
const StudentProfile = require("../../models/studentProfile.model");

const getOwnerDashboard = async (req, res) => {
  try {
    // -------------------  Get Library ----------------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // -------------------------- Date helper ---------------------
    const now = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 7 days from now (for expiring memberships alert)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999);

    // 30 days ago (for revenue graph)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // -------------------------- All Query Run parallel -----------------------
    const [
      totalApprovedMembers, // how many approved students
      totalPendingMembers, // waiting for approval
      totalActiveBookings, // currently active bookings
      totalSeats, // total seats in library
      todayRevenue, // money collected today
      thisMonthRevenue, // money collected this month
      expiringBookings, // plans expiring in 7 days
      defaulters, // students with unpaid fees
      todayAttendanceCount, // how many came today
      todayFailedScans, // failed scan attempts today
      revenueGraph, // last 30 days revenue for chart
      recentEntryLogs, // last 5 scans (live feed)
    ] = await Promise.all([
      // 1. Total approved members
      StudentProfile.countDocuments({
        approvalStatus: "approved",
      }),

      // 2. Pending approval members
      StudentProfile.countDocuments({
        approvalStatus: "pending",
      }),

      // 3. Active bookings (occupied seats right now)
      Booking.countDocuments({
        libraryId: library._id,
        status: "active",
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),

      // 4. Total seats
      Seat.countDocuments({
        libraryId: library._id,
        status: { $ne: "disabled" },
      }),

      // 5. Today's revenue
      Payment.aggregate([
        {
          $match: {
            libraryId: library._id,
            status: "paid",
            paidAt: { $gte: todayStart, $lte: todayEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // 6. This month's revenue
      Payment.aggregate([
        {
          $match: {
            libraryId: library._id,
            status: "paid",
            paidAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // 7. Expiring memberships (next 7 days alert)
      Booking.find({
        libraryId: library._id,
        status: "active",
        endDate: { $gte: now, $lte: sevenDaysLater },
      })
        .populate("studentId", "firstName lastName phone")
        .populate("seatId", "seatLabel")
        .populate("timeSlotId", "name")
        .sort({ endDate: 1 }) // soonest expiry first
        .limit(10),

      // 8. Defaulters (active bookings with pending payment)
      Payment.find({
        libraryId: library._id,
        status: "pending",
        paymentMode: "cash", // only cash payments can be pending
      })
        .populate("studentId", "firstName lastName phone")
        .populate("bookingId", "startDate endDate status")
        .limit(10),

      // 9. Today's attendance count
      Attendance.countDocuments({
        libraryId: library._id,
        date: { $gte: todayStart, $lte: todayEnd },
      }),

      // 10. Today's failed scans
      EntryLog.countDocuments({
        libraryId: library._id,
        scanResult: "failed",
        scanTime: { $gte: todayStart },
      }),

      // 11. Revenue graph — last 30 days grouped by date
      // Frontend passes this directly to Recharts
      Payment.aggregate([
        {
          $match: {
            libraryId: library._id,
            status: "paid",
            paidAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
            },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } }, // oldest to newest for graph
      ]),

      // 12. Recent entry logs (live feed on dashboard)
      EntryLog.find({ libraryId: library._id })
        .populate("studentId", "firstName lastName")
        .populate("scannedBy", "firstName lastName")
        .sort({ scanTime: -1 })
        .limit(5),
    ]);

    // -------------------- Calculate occupancy rate ---------------------
    // What % of seats are currently booked
    const occupancyRate =
      totalSeats > 0 ? Math.round((totalActiveBookings / totalSeats) * 100) : 0;

    // ----------------------- Return Response -----------------
    return res.status(200).json({
      // ----- STATS CARDS ------
      stats: {
        totalMembers: totalApprovedMembers,
        pendingApprovals: totalPendingMembers,
        activeBookings: totalActiveBookings,
        totalSeats: totalSeats,
        occupancyRate: `${occupancyRate}%`,
        todayAttendance: todayAttendanceCount,
        todayFailedScans: todayFailedScans,
      },

      // -------- REVENUE --------
      revenue: {
        today: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
        thisMonth: thisMonthRevenue.length > 0 ? thisMonthRevenue[0].total : 0,
      },

      alerts: {
        expiringMemberships: expiringBookings.map((b) => ({
          studentName: b.studentId
            ? `${b.studentId.firstName} ${b.studentId.lastName}`
            : "N/A",
          phone: b.studentId ? b.studentId.phone : "N/A",
          seat: b.seatId ? b.seatId.seatLabel : "N/A",
          slot: b.timeSlotId ? b.timeSlotId.name : "N/A",
          expiresOn: b.endDate,
          daysLeft: Math.ceil(
            (new Date(b.endDate) - now) / (1000 * 60 * 60 * 24),
          ),
        })),

        defaulters: defaulters
          .filter((p) => p.bookingId && p.bookingId.status === "active")
          .map((p) => ({
            studentName: p.studentId
              ? `${p.studentId.firstName} ${p.studentId.lastName}`
              : "N/A",
            phone: p.studentId ? p.studentId.phone : "N/A",
            amountDue: p.amount,
            paymentId: p._id,
          })),
      },

      // ----- REVENUE GRAPH -----------
      revenueGraph,

      // ------- LIVE FEED -----------
      recentScans: recentEntryLogs,
    });
  } catch (error) {
    console.error("getOwnerDashboard error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOwnerDashboard;
