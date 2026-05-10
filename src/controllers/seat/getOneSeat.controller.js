const Floor = require("../../models/floor.model");
const Library = require("../../models/library.model");
const Seat = require("../../models/seat.model");

const getOneSeat = async (req, res) => {
  try {
    // ----------------- Extract floorId and seatId --------------
    const { floorId, seatId } = req.params;

    // ----------------- 1 get Library --------------
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary)
      return res.status(404).json({ message: "Library not found" });

    // ----------------- 2 get Floor --------------
    const existingFloor = await Floor.findOne({
      _id: floorId,
      libraryId: existingLibrary._id,
    });
    if (!existingFloor)
      return res.status(404).json({ message: "Floor not found" });

    // ------------- 3 get Seat ------------------
    const existingSeat = await Seat.findOne({
      _id: seatId,
      floorId,
    });
    if (!existingSeat)
      return res.status(404).json({ message: "Seat not found" });

    // ---------------- 4 Success message -----------
    return res.status(200).json({ seat: existingSeat });
  } catch (error) {
    console.error("getOneSeat error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOneSeat;
