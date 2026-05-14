const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");

const getRevenueSummary = async (req, res) => {
  try {
    // ------- Get Library --------------------------
    const library = await Library.findOne({ ownerId: req.user.id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // -------------------- Date boundaries ------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Sunday = start of week

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // -------------------- Run All query together -----------------------

    const [todayRevenue, weekRevenue, monthRevenue, graphData] =
      await Promise.all([
        // Today's revenue
        Payment.aggregate([
          {
            $match: {
              libraryId: library._id,
              status: "paid",
              paidAt: { $gte: today, $lt: tomorrow },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        // this week's total
        Payment.aggregate([
          {
            $match: {
              libraryId: library._id,
              status: "paid",
              paidAt: { $gte: firstDayOfWeek, $lt: tomorrow },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        // This month's total
        Payment.aggregate([
          {
            $match: {
              libraryId: library._id,
              status: "paid",
              paidAt: { $gte: firstDayOfMonth, $lt: tomorrow },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),

        //   Last 30 days grouped by date (for Recharts graph on frontend)
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
          { $sort: { _id: 1 } },
        ]),
      ]);

    // -------------------- Return Success message ----------------
    return res.status(200).json({
      today: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
      thisWeek: weekRevenue.length > 0 ? weekRevenue[0].total : 0,
      thisMonth: monthRevenue.length > 0 ? monthRevenue[0].total : 0,
      graphData,
    });
  } catch (error) {
    console.error("getRevenueSummary error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getRevenueSummary;
