const Booking = require("../../models/booking.model");
const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");
const Plan = require("../../models/plan.model");
const QRCode = require("../../models/qrCode.model");
const Seat = require("../../models/seat.model");
const TimeSlot = require("../../models/timeSlot.model");
const checkOverlap = require("../../utils/checkOverlap");
const { v4: uuidv4 } = require("uuid");

const extendBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // ----------------- 1 Get Library ------------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ---------------- 2 Get booking -------------------------------------------
    const existingBooking = await Booking.findOne({
      _id: bookingId,
      libraryId: library._id,
    });

    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (existingBooking.status !== "active") {
      return res.status(400).json({
        message: `Only active bookings can be extended. This booking is "${existingBooking.status}". Create a new booking instead.`,
      });
    }

    // ---------------- 3 VErify seat, slot, plan ------------------------------------------------
    const [seat, timeSlot, plan] = await Promise.all([
      Seat.findById(existingBooking.seatId),
      TimeSlot.findById(existingBooking.timeSlotId),
      Plan.findById(existingBooking.planId),
    ]);

    if (!seat || seat.status !== "active") {
      return res
        .status(400)
        .json({ message: "Seat is no longer available for extension." });
    }
    if (!timeSlot || !timeSlot.isActive) {
      return res
        .status(400)
        .json({ message: "Time slot is no longer active." });
    }
    if (!plan || !plan.isActive) {
      return res.status(400).json({ message: "Plan is no longer active." });
    }

    // ---------------- 4 New period starts day AFTER current booking ends--------------------------------------------
    const newStartDate = new Date(existingBooking.endDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    newStartDate.setHours(0, 0, 0, 0);

    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + 30);
    newEndDate.setHours(23, 59, 59, 999);

    // ---------------- 5 Check overlap ---------------------
    const overlapping = await checkOverlap(
      seat._id,
      timeSlot._id,
      newStartDate,
      newEndDate,
    );

    if (overlapping) {
      return res.status(409).json({
        message:
          "Cannot extend. Another booking exists for this seat in the extension period.",
      });
    }

    // ---------------- 6 create new booking ---------------------
    const newBooking = await Booking.create({
      libraryId: library._id,
      studentId: existingBooking.studentId,
      seatId: existingBooking.seatId,
      timeSlotId: existingBooking.timeSlotId,
      planId: existingBooking.planId,
      bookedBy: req.user.id,
      status: "active",
      price: plan.calculatedPrice, // fresh snapshot for new period
      startDate: newStartDate,
      endDate: newEndDate,
      approvedBy: req.user.id,
      approvedAt: new Date(),
      extendedFrom: existingBooking._id, // history chain
    });

    // ---------------- 7  Create new payment ---------------------
    const payment = await Payment.create({
      libraryId: library._id,
      bookingId: newBooking._id,
      studentId: existingBooking.studentId,
      amount: newBooking.price,
      paymentMode: "cash",
      status: "pending",
    });

    // ---------------- 8 Create new QRCode -----------------
    const qrCode = await QRCode.create({
      bookingId: newBooking._id,
      studentId: existingBooking.studentId,
      token: uuidv4(),
      status: "active",
      expiresAt: newEndDate,
    });

    // --------------------- 9 Success message ---------------------
    return res.status(201).json({
      message: "Booking extended successfully.",
      newBooking,
      payment: { id: payment._id, amount: payment.amount },
      qrCode: { id: qrCode._id, expiresAt: qrCode.expiresAt },
    });
  } catch (error) {
    console.error("extendBooking error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = extendBooking;
