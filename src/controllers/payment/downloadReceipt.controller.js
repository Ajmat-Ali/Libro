const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");
const StudentProfile = require("../../models/studentProfile.model");
const User = require("../../models/user.model");
const generateReceipt = require("../../utils/generateReceipt");

const downloadReceipt = async (req, res) => {
  try {
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    const payment = await Payment.findOne({
      _id: req.params.paymentId,
      libraryId: library._id,
      status: "paid",
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
        message: "Receipt not found or payment is not paid yet.",
      });
    }

    const [user, profile] = await Promise.all([
      User.findById(payment.studentId).select("firstName lastName email phone"),
      StudentProfile.findOne({ userId: payment.studentId }).select(
        "membershipId",
      ),
    ]);

    const receiptData = {
      receiptNumber: payment._id.toString().slice(-8).toUpperCase(),
      libraryName: library.name,
      libraryAddress: `${library.address.street}, ${library.address.city}, ${library.address.state} - ${library.address.pincode}`,
      libraryPhone: library.contact.phone,
      studentName: user ? `${user.firstName} ${user.lastName}` : "N/A",
      membershipId: profile ? profile.membershipId : "N/A",
      studentPhone: user ? user.phone : "N/A",
      studentEmail: user ? user.email : "N/A",
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

    await generateReceipt(res, receiptData);
  } catch (error) {
    console.error("downloadReceipt error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = downloadReceipt;
