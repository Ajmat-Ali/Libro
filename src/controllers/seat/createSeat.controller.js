const { validateCreateSeat } = require("../../validators/seat.validator");
const Seat = require("../../models/seat.model");
const Library = require("../../models/library.model");
const Floor = require("../../models/floor.model");
const syncPlans = require("../../utils/syncPlans");

const createSeat = async (req, res) => {
  try {
    const { floorId } = req.params;
    const ownerId = req.user._id;

    const { errors, isValid } = validateCreateSeat(req.body);

    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const existingLibrary = await Library.findOne({ ownerId });
    if (!existingLibrary) {
      return res.status(404).json({
        message: "Library not found. Please set up your library first.",
      });
    }

    const existingFloor = await Floor.findOne({
      _id: floorId,
      libraryId: existingLibrary._id,
    });
    if (!existingFloor) {
      return res.status(404).json({ message: "Floor not found." });
    }

    const seatLabel = req.body.seatLabel.trim().toUpperCase();

    const existingSeat = await Seat.findOne({
      floorId: floorId,
      seatLabel,
      libraryId: existingLibrary._id,
    });
    if (existingSeat) {
      return res
        .status(409)
        .json({ message: `Seat ${seatLabel} already exists on this floor.` });
    }

    const seat = await Seat.create({
      floorId,
      libraryId: existingLibrary._id,
      seatLabel,
      seatType: req.body.seatType.trim().toLowerCase() || "general",
      description: req.body.description ? req.body.description.trim() : null,
    });

    await Floor.findByIdAndUpdate(floorId, { $inc: { totalSeats: 1 } });

    await syncPlans(existingLibrary._id);

    return res.status(201).json({
      message: "Seat created successfully.",
      seat,
    });
  } catch (error) {
    console.error("Error creating seat:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong while creating the seat" });
  }
};

module.exports = createSeat;
