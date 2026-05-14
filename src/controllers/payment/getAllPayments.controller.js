const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");

const getAllPayments = async (req, res) => {
  try {
    // -------------------- GEt Library -------------------
    const library = await Library.findOne({ ownerId: req.user.id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------- Get page and limit and other data from query ----------------
    const { status, paymentMode, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // ------------------------- Filter ----------------
    const filter = { libraryId: library._id };
    if (status) filter.status = status;
    if (paymentMode) filter.paymentMode = paymentMode;

    const total = await Payment.countDocuments(filter);

    // ------------------------- Find Payment  ----------------
    const payments = await Payment.find(filter)
      .populate("studentId", "firstName lastName email")
      .populate("bookingId", "startDate endDate status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // -------------------------  Return success message ----------------
    return res.status(200).json({
      message: "Paymet fetched successfully",
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      payments,
    });
  } catch (error) {
    console.error("getAllPayments error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getAllPayments;
