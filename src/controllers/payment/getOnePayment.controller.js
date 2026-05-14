const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");

const getOnePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    // --------------------------------- Get library -------------------------
    const library = await Library.findOne({ ownerId: req.user.id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------ Get Payment --------------------
    const payment = await Payment.findOne({
      _id: paymentId,
      libraryId: library._id,
    })
      .populate("studentId", "firstName lastName email phone")
      .populate("bookingId");
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    return res.status(200).json({ payment });
  } catch (error) {
    console.error("getOnePayment error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOnePayment;
