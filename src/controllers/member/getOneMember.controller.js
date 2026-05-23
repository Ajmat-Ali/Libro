const StudentProfile = require("../../models/studentProfile.model");
const Booking = require("../../models/booking.model");
const Payment = require("../../models/payment.model");

const getOneMember = async (req, res) => {
  try {
    const { memberId } = req.params; // userId only is memberId

    // -------------- 1 Get studentProfile ----------------
    const profile = await StudentProfile.findOne({ _id: memberId })
      .populate("userId", "-password -refreshTokens -passwordResetOtp")
      .select("-emailOtp");
    if (!profile || !profile.userId) {
      return res.status(404).json({ message: "Member not found." });
    }

    // --------------------- 2 Summary Data -------------------------------
    const [activeBookingsCount, pendingPaymentsCount, totalPaidResult] =
      await Promise.all([
        await Booking.countDocuments({
          studentId: memberId,
          status: "active",
        }),
        Payment.countDocuments({
          studentId: memberId,
          status: "pending",
        }),
        Payment.aggregate([
          { $match: { studentId: memberId, status: "paid" } },
          { $project: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    const totalPaid = totalPaidResult.length > 0 ? totalPaidResult[0].total : 0;

    return res.status(200).json({
      member: {
        // user: profile.userId,
        profile,
        summary: {
          activeBookingsCount,
          pendingPaymentsCount,
          totalPaid,
        },
      },
    });
  } catch (error) {
    console.error("getOneMember error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOneMember;
