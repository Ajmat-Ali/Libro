const Library = require("../../models/library.model");
const Floor = require("../../models/floor.model");
const Seat = require("../../models/seat.model");

const getAllSeats = async (req, res) => {
  try {
    const { floorId } = req.params;

    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary)
      return res.status(404).json({ message: "Library not found" });

    const existingFloor = await Floor.findOne({
      _id: floorId,
      libraryId: existingLibrary._id,
    });
    if (!existingFloor)
      return res.status(404).json({ message: "Floor not found" });

    const seats = await Seat.find({ floorId }).sort({ seatLabel: 1 });

    return res.status(200).json({
      message: "Seats fetched successfully.",
      floor: {
        _id: existingFloor._id,
        name: existingFloor.name,
        number: existingFloor.number,
        totalSeats: existingFloor.totalSeats,
        isActive: existingFloor.isActive,
      },
      count: seats.length,
      seats,
    });
  } catch (error) {
    console.error("getAllSeats error:", err.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getAllSeats;
