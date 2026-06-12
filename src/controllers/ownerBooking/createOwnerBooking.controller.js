const Library = require("../../models/library.model");
const Payment = require("../../models/payment.model");
const Plan = require("../../models/plan.model");
const QRCode = require("../../models/qrCode.model");
const Seat = require("../../models/seat.model");
const StudentProfile = require("../../models/studentProfile.model");
const TimeSlot = require("../../models/timeSlot.model");
const User = require("../../models/user.model");
const checkOverlap = require("../../utils/checkOverlap");
const Booking = require("../../models/booking.model");
const { v4: uuidv4 } = require("uuid");

const {
  validateCreateOwnerBooking,
} = require("../../validators/booking.validator");

const createOwnerBooking = async (req, res) => {
  try {
    //---------------------- 1 Validate request body-----------------------------
    const { errors, isValid } = validateCreateOwnerBooking(req.body);
    if (!isValid) return res.status(400).json({ errors });

    // ---------------------------2 Get Library --------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({
        message: "Library not found. Please set up your library first.",
      });
    }

    // ------------------ 3 // Step 2: Check student exists, is approved, and is not suspended -------

    const student = await User.findById(req.body.studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const studentProfile = await StudentProfile.findOne({
      userId: student._id,
    });
    if (!studentProfile || studentProfile.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "Student is not approved. Approve the student first.",
      });
    }

    if (!student.isActive) {
      return res.status(400).json({
        message: "Student account is suspended. Reactivate before booking.",
      });
    }

    // --------------- 4  Check seat exists and is bookable-------------------------------

    const seat = await Seat.findOne({
      _id: req.body.seatId,
      libraryId: library._id,
    });

    if (!seat) {
      return res.status(404).json({ message: "Seat not found." });
    }
    if (seat.status !== "active") {
      return res.status(400).json({
        message: `Seat "${seat.seatLabel}" is currently "${seat.status}". Only active seats can be booked.`,
      });
    }
    // ------------------------ 5 Check time slot exists and is active-------------------
    const timeSlot = await TimeSlot.findOne({
      _id: req.body.timeSlotId,
      libraryId: library._id,
    });
    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found." });
    }
    if (!timeSlot.isActive) {
      return res.status(400).json({ message: "This time slot is disabled." });
    }

    // ---------------------- 6 Check plan exists and is active ---------------------------------
    const plan = await Plan.findOne({
      libraryId: library._id,
      timeSlotId: timeSlot._id,
      seatType: seat.seatType,
      isActive: true,
    });

    if (!plan) {
      return res.status(400).json({
        message: `No active plan found for "${seat.seatType}" seat with "${timeSlot.name}" slot. Please check your plan settings.`,
      });
    }

    // ---------------------- 7 Calculate dates --------------------------
    const startDate = new Date(req.body.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    endDate.setHours(23, 59, 59, 999);

    // ------------------------- 8 Check startDate is a working day ---------------------
    const dayName = startDate.toLocaleDateString("en-US", { weekday: "long" });

    if (!library.workingDays.includes(dayName)) {
      return res.status(400).json({
        message: `${dayName} is not a working day for this library.`,
      });
    }

    // -------------------------- 9 Check startDate is not a holiday -----------------------
    const isHoliday = library.holidays.some((holiday) => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.toDateString() === startDate.toDateString();
    });
    if (isHoliday) {
      return res.status(400).json({
        message:
          "Selected start date is a holiday. Please choose another date.",
      });
    }

    // ----------------------- 10 OVERLAP DETECTION ----------------------
    const overlapping = await checkOverlap(
      seat._id,
      timeSlot._id,
      startDate,
      endDate,
    );
    if (overlapping) {
      return res.status(409).json({
        message: `Seat "${seat.seatLabel}" is already booked for this slot.`,
        existingBookingEnds: overlapping.endDate,
      });
    }

    // --------------------- 11 Create the booking ----------------------------
    const booking = await Booking.create({
      libraryId: library._id,
      studentId: student._id,
      seatId: seat._id,
      timeSlotId: timeSlot._id,
      planId: plan._id,
      bookedBy: req.user._id,
      status: "active",
      price: plan.calculatedPrice,
      startDate: startDate,
      endDate: endDate,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });

    // ------------------- 12 Auto create payment document ------------------------
    const payment = await Payment.create({
      libraryId: library._id,
      bookingId: booking._id,
      studentId: student._id,
      amount: booking.price,
      paymentMode: "cash",
      status: "pending",
    });

    // ------------------------- 13 Auto generate QRCode ----------------------
    const qrCode = await QRCode.create({
      bookingId: booking._id,
      studentId: student._id,
      token: uuidv4(),
      status: "active",
      expiresAt: endDate,
    });

    // ----------------------- Success message ---------------------------
    return res.status(201).json({
      message: "Booking created successfully.",
      booking,
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        mode: payment.paymentMode,
      },
      qrCode: {
        id: qrCode._id,
        expiresAt: qrCode.expiresAt,
      },
    });
  } catch (error) {
    console.error("createOwnerBooking error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = createOwnerBooking;
