const Library = require("../../models/library.model");
const TimeSlot = require("../../models/timeSlot.model");

const getAllSlot = async (req, res) => {
  try {
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not found." });
    }

    const slots = await TimeSlot.find({ libraryId: existingLibrary._id }).sort({
      startTimeMinutes: 1,
    });

    return res.status(200).json({
      message: "Slots fetched successfully.",
      count: slots.length,
      slots,
    });
  } catch (error) {
    console.error("getAllSlots error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getAllSlot;
