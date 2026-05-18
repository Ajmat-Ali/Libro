const Attendance = require("../../models/attendance.model");
const Library = require("../../models/library.model");

const getAttendanceReport = async (req, res) => {
  try {
    // ----------------------- Get Library -------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ---------------------------- Over all attendance --------------------------
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [dailyTrend, totalScansThisMonth, uniqueStudentsThisMonth] =
      await Promise.all([
        // Daily attendance count for last 30 days (for graph)
        Attendance.aggregate([
          { $match: { libraryId: library._id, date: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
              total: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Total scans this month
        Attendance.countDocuments({
          libraryId: library._id,
          date: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        }),

        // Unique students who came this month
        Attendance.distinct("studentId", {
          libraryId: library._id,
          date: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        }),
      ]);

    // ---------------------------- Return -------------
    return res.status(200).json({
      thisMonth: {
        totalAttendance: totalScansThisMonth,
        uniqueStudents: uniqueStudentsThisMonth.length,
      },
      dailyTrend,
    });
  } catch (error) {
    console.error("getAttendanceReport error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getAttendanceReport;
