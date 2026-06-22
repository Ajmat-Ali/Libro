const Library = require("../../models/library.model");
const TimeSlot = require("../../models/timeSlot.model");

const getOneSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not found." });
    }

    const slot = await TimeSlot.findOne({
      _id: slotId,
      libraryId: existingLibrary._id,
    });

    if (!slot) return res.status(404).json({ message: "Slot not found." });

    return res.status(200).json({ slot });
  } catch (error) {
    console.error("getOneSlot error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOneSlot;
