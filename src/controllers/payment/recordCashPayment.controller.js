const Booking = require("../../models/booking.model");
const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");

const recordCashPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    const payment = await Payment.findOne({
      _id: paymentId,
      libraryId: library._id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    if (payment.status === "paid") {
      return res
        .status(400)
        .json({ message: "Payment is already marked as paid." });
    }

    if (payment.paymentMode !== "cash") {
      return res.status(400).json({
        message: "This is an online payment. Cannot mark as cash.",
      });
    }

    const booking = await Booking.findById(payment.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "No booking found" });
    }

    if (booking && booking.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot record payment for a cancelled booking.",
      });
    }

    if (req.body.discount && parseFloat(req.body.discount) > 0) {
      const discount = parseFloat(req.body.discount);
      if (discount >= payment.amount) {
        return res.status(400).json({
          message: "Discount cannot be equal to or more than the total amount.",
        });
      }

      payment.amount = payment.amount - discount;
    }

    payment.status = "paid";
    payment.recordedBy = req.user._id;
    payment.recordedAt = new Date();
    payment.paidAt = new Date();

    if (req.body.notes) {
      payment.notes = req.body.notes.toString().trim();
    }

    await payment.save();

    return res.status(200).json({
      message: "Cash payment recorded successfully.",
      payment,
    });
  } catch (error) {
    console.error("recordCashPayment error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = recordCashPayment;
