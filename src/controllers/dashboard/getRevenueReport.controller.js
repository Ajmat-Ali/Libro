const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");

const getRevenueReport = async (req, res) => {
  try {
    // ---------- Get Library -----------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // --------------------------Get revenue by payment mode and by month ------------------
    const [cashRevenue, onlineRevenue, pendingAmount, monthlyBreakdown] =
      await Promise.all([
        Payment.aggregate([
          {
            $match: {
              libraryId: library._id,
              status: "paid",
              paymentMode: "cash",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),

        Payment.aggregate([
          {
            $match: {
              libraryId: library._id,
              status: "paid",
              paymentMode: "online",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),

        Payment.aggregate([
          {
            $match: {
              libraryId: library._id,
              status: "pending",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),

        Payment.aggregate([
          {
            $match: {
              libraryId: library._id,
              status: "paid",
              paidAt: {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
              },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$paidAt" } },
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    // -------------------------- Total calculation ---------------------
    const totalCollected =
      (cashRevenue.length > 0 ? cashRevenue[0].total : 0) +
      (onlineRevenue.length > 0 ? onlineRevenue[0].total : 0);

    // -------------------------- Return message -----------------
    return res.status(200).json({
      totalCollected,
      byMode: {
        cash: cashRevenue.length > 0 ? cashRevenue[0].total : 0,
        online: onlineRevenue.length > 0 ? onlineRevenue[0].total : 0,
      },
      pendingAmount: pendingAmount.length > 0 ? pendingAmount[0].total : 0,
      monthlyBreakdown,
    });
  } catch (error) {
    console.error("getRevenueReport error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getRevenueReport;
