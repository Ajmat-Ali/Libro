const Library = require("../../models/library.model");
const Plan = require("../../models/plan.model");
const TimeSlot = require("../../models/timeSlot.model");

const toggleSlotStatus = async (req, res) => {
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

    existingSlot.isActive = !existingSlot.isActive;
    existingSlot.statusUpdatedBy = req.user.id;
    existingSlot.statusUpdatedAt = new Date();

    await existingSlot.save();

    // ------------------------- 4 --------------------------------
    // Disabling slot - disable all its plans too
    // Enabling slot - enable all its plans too
    await Plan.updateMany(
      { libraryId: existingLibrary._id, timeSlotId: existingSlot._id },
      { isActive: existingSlot.isActive },
    );

    return res.status(200).json({
      message: `Slot ${existingSlot.isActive ? "activated" : "deactivated"} successfully.`,
      isActive: existingSlot.isActive,
    });
  } catch (error) {
    console.error("toggleSlotStatus error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = toggleSlotStatus;
