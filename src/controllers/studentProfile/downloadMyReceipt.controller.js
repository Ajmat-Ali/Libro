const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");
const StudentProfile = require("../../models/studentProfile.model");
const User = require("../../models/user.model");
const generateReceipt = require("../../utils/generateReceipt");

const downloadMyReceipt = async (req, res) => {
  try {
    // ----------------- Find payment AND make sure it belongs to this student ---------------------
    const payment = await Payment.findOne({
      _id: req.params.paymentId,
      studentId: req.user._id,
      status: "paid", // only paid payments have receipts
    }).populate({
      path: "bookingId",
      populate: [
        { path: "seatId", select: "seatLabel seatType" },
        {
          path: "timeSlotId",
          select: "name startTimeDisplay endTimeDisplay",
        },
      ],
    });
    if (!payment) {
      return res.status(404).json({
        message: "Receipt not found. Payment may not exist or is not yet paid.",
      });
    }
    // -------------------------  Get student details for receipt -----------------
    const user = await User.findById(req.user.id).select(
      "firstName lastName email phone",
    );
    const profile = await StudentProfile.findOne({
      userId: req.user.id,
    }).select("membershipId");

    const library = await Library.findOne({}).select("name address contact");

    // ---------------------- Build receipt data object ----------------------------
    const receiptData = {
      receiptNumber: payment._id.toString().slice(-8).toUpperCase(),
      libraryName: library ? library.name : "Libro Library",
      libraryAddress: library
        ? `${library.address.street}, ${library.address.city}, ${library.address.state} - ${library.address.pincode}`
        : "",
      libraryPhone: library ? library.contact.phone : "",
      studentName: `${user.firstName} ${user.lastName}`,
      membershipId: profile ? profile.membershipId : "N/A",
      studentPhone: user.phone || "N/A",
      studentEmail: user.email,
      seatLabel: payment.bookingId?.seatId?.seatLabel || "N/A",
      seatType: payment.bookingId?.seatId?.seatType || "N/A",
      slotName: payment.bookingId?.timeSlotId?.name || "N/A",
      slotTime: payment.bookingId?.timeSlotId
        ? `${payment.bookingId.timeSlotId.startTimeDisplay} - ${payment.bookingId.timeSlotId.endTimeDisplay}`
        : "N/A",
      startDate: payment.bookingId?.startDate,
      endDate: payment.bookingId?.endDate,
      amount: payment.amount,
      paymentMode: payment.paymentMode,
      status: payment.status,
      paidAt: payment.paidAt,
      razorpayPaymentId: payment.razorpayPaymentId || null,
    };

    // ---------------- Generate and send PDF ------------------
    await generateReceipt(res, receiptData);
  } catch (error) {
    console.error("downloadMyReceipt error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = downloadMyReceipt;
