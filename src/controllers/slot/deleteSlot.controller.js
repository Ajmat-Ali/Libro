const Booking = require("../../models/booking.model");
const Library = require("../../models/library.model");
const Plan = require("../../models/plan.model");
const TimeSlot = require("../../models/timeSlot.model");

const deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not found." });
    }

    const existingSlot = await TimeSlot.findOne({
      _id: slotId,
      libraryId: existingLibrary._id,
    });
    if (!existingSlot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    const bookingExists = await Booking.findOne({
      timeSlotId: slotId,
      status: { $in: ["pending", "active"] },
    });
    if (bookingExists) {
      return res.status(400).json({
        message:
          "Cannot delete slot. Active or pending bookings exist. Cancel all bookings first.",
      });
    }

    await Plan.deleteMany({ timeSlotId: slotId });

    await TimeSlot.findByIdAndDelete(existingSlot._id);

    return res.status(200).json({
      message: "Slot and its associated plans deleted successfully.",
    });
  } catch (error) {
    console.error("deleteSlot error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = deleteSlot;
