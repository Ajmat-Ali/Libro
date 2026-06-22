const Library = require("../../models/library.model");
const Floor = require("../../models/floor.model");
const Seat = require("../../models/seat.model");

const deleteFloor = async (req, res) => {
  try {
    const { floorId } = req.params;

    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not created yet" });
    }

    const existingFloor = await Floor.findOne({
      libraryId: existingLibrary._id,
      _id: floorId,
    });
    if (!existingFloor) {
      return res
        .status(404)
        .json({ message: "Floor not found for the library" });
    }

    const seatCount = await Seat.countDocuments({ floorId: floorId });
    if (seatCount > 0) {
      return res.status(400).json({
        message: `Cannot delete floor. It has ${seatCount} seat(s). Remove all seats first.`,
      });
    }

    await Floor.findByIdAndDelete(floorId);

    return res.status(200).json({ message: "Floor deleted successfully." });
  } catch (error) {
    console.error("Error to deleting floor:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong to deleting floor" });
  }
};

module.exports = deleteFloor;
