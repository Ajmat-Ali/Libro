const Payment = require("../../models/payment.model");

const getMyPayments = async (req, res) => {
  try {
    // ---------------------- Get query data -------------
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // -------------------- Filter and get payment docs -----------------
    const filter = { studentId: req.user._id };
    if (status) filter.status = status;

    const total = await Payment.countDocuments(filter);

    const payments = await Payment.find(filter)
      .populate({
        path: "bookingId",
        populate: [
          { path: "seatId", select: "seatLabel seatType" },
          {
            path: "timeSlotId",
            select: "name startTimeDisplay endTimeDisplay",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // ----------------------- Summary: total paid and total pending -------------------------
    const [totalPaidResult, totalPendingResult] = await Promise.all([
      Payment.aggregate([
        {
          $match: {
            studentId: payments[0]?.studentId || req.user._id,
            status: "paid",
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            studentId: payments[0]?.studentId || req.user.id,
            status: "pending",
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    // ----------------------- Return Success message -----------------
    return res.status(200).json({
      summary: {
        totalPaid: totalPaidResult.length > 0 ? totalPaidResult[0].total : 0,
        totalPending:
          totalPendingResult.length > 0 ? totalPendingResult[0].total : 0,
      },
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      payments,
    });
  } catch (error) {
    console.error("getMyPayments error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getMyPayments;
