const Library = require("../../models/library.model");
const TimeSlot = require("../../models/timeSlot.model");

const getOneSlot = async (req, res) => {
  try {
    // -------------------- 1 GEt slotId from req.params -----------------
    const { slotId } = req.params;

    // -------------------- 2 Find Library -----------------
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not found." });
    }

    // -------------------- 3 Find Slot -----------------
    const slot = await TimeSlot.findOne({
      _id: slotId,
      libraryId: existingLibrary._id,
    });

    if (!slot) return res.status(404).json({ message: "Slot not found." });

    // -------------------- 4 Return success message -----------------
    return res.status(200).json({ slot });
  } catch (error) {
    console.error("getOneSlot error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOneSlot;
