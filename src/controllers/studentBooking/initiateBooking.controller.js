const Library = require("../../models/library.model");
const Plan = require("../../models/plan.model");
const Seat = require("../../models/seat.model");
const TimeSlot = require("../../models/timeSlot.model");
const checkOverlap = require("../../utils/checkOverlap");
const razorpayInstance = require("../../config/razorpay");
const {
  validateInitiateStudentBooking,
} = require("../../validators/booking.validator");

const initiateBooking = async (req, res) => {
  try {
    // -------------- 1 Validate req input --------------------------------
    const { isValid, errors } = validateInitiateStudentBooking(req.body);
    if (!isValid) return res.status(400).json({ errors });

    // ------------------------ 2 Find Library -----------------
    const library = await Library.findOne({});
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------------ 3 Check seat is active ----------------
    const seat = await Seat.findOne({
      _id: req.body.seatId,
      libraryId: library._id,
    });
    if (!seat) {
      return res.status(404).json({ message: "Seat not found." });
    }
    if (seat.status !== "active") {
      return res.status(400).json({
        message: `Seat "${seat.seatLabel}" is not available for booking.`,
      });
    }

    // ------------------------ 4 Check timeSlot is active --------------
    const timeSlot = await TimeSlot.findOne({
      _id: req.body.timeSlotId,
      libraryId: library._id,
    });
    if (!timeSlot || !timeSlot.isActive) {
      return res
        .status(404)
        .json({ message: "Time slot not found or disabled." });
    }

    // ------------------------ 5 Check plan is active ----------------
    const plan = await Plan.findOne({
      _id: req.body.planId,
      libraryId: library._id,
    });
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: "Plan not found or disabled." });
    }

    // ------------------------ 6 Calculate dates -------------------------
    const startDate = new Date(req.body.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    endDate.setHours(23, 59, 59, 999);

    // Check working day
    const dayName = startDate.toLocaleDateString("en-US", { weekday: "long" });
    if (!library.workingDays.includes(dayName)) {
      return res.status(400).json({
        message: `${dayName} is not a working day for this library.`,
      });
    }

    // ------------------------ 7 Check holiday -----------------------
    const isHoliday = library.holidays.some((h) => {
      return new Date(h.date).toDateString() === startDate.toDateString();
    });
    if (isHoliday) {
      return res.status(400).json({
        message: "Selected date is a holiday. Please choose another date.",
      });
    }

    // ------------------------ 8 Overlap check ----------------------
    const overlapping = await checkOverlap(
      seat._id,
      timeSlot._id,
      startDate,
      endDate,
    );
    if (overlapping) {
      return res.status(409).json({
        message:
          "This seat is already booked for the selected time slot and dates.",
      });
    }

    // ------------------------ 9 Create Razorpay order -------------------
    const amountInPaise = Math.round(plan.calculatedPrice * 100);

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`, // unique receipt ID
      notes: {
        // Storing all booking details here
        // Webhook will read these to create the actual booking
        studentId: req.user.id.toString(),
        libraryId: library._id.toString(),
        seatId: seat._id.toString(),
        timeSlotId: timeSlot._id.toString(),
        planId: plan._id.toString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        price: plan.calculatedPrice.toString(),
      },
    });

    // ------------------------ 10 Return orderID to frontend ------------------
    return res.status(200).json({
      message: "Order created. Complete payment to confirm your booking.",
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      bookingPreview: {
        seatLabel: seat.seatLabel,
        seatType: seat.seatType,
        slotName: timeSlot.name,
        slotTime: `${timeSlot.startTimeDisplay} - ${timeSlot.endTimeDisplay}`,
        startDate: startDate,
        endDate: endDate,
        amount: plan.calculatedPrice,
      },
    });
  } catch (error) {
    console.error("initiateBooking error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = initiateBooking;
