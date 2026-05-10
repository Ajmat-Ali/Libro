const { validateCreateSeat } = require("../../validators/seat.validator");
const Seat = require("../../models/seat.model");
const Library = require("../../models/library.model");
const Floor = require("../../models/floor.model");
const syncPlans = require("../../utils/syncPlans");

const createSeat = async (req, res) => {
  try {
    // ----------------------- Extract floorId, owner Id --------------------------------
    const { floorId } = req.params;
    const ownerId = req.user._id;

    // ------------------------ 1 Validate input -------------------------
    const { errors, isValid } = validateCreateSeat(req.body);

    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // ----------------------- 2  find Library Exist ----------------------------
    const existingLibrary = await Library.findOne({ ownerId });
    if (!existingLibrary) {
      return res.status(404).json({
        message: "Library not found. Please set up your library first.",
      });
    }

    // ----------------------- 3  find Floor Exist ----------------------------
    const existingFloor = await Floor.findOne({
      _id: floorId,
      libraryId: existingLibrary._id,
    });
    if (!existingFloor) {
      return res.status(404).json({ message: "Floor not found." });
    }

    // ----------------------- 4  chech duplicate seatLabel on same floor ------------------
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

    // ----------------------- 5  Create Seat ----------------------------
    const seat = await Seat.create({
      floorId,
      libraryId: existingLibrary._id,
      seatLabel,
      seatType: req.body.seatType.trim().toLowerCase() || "general",
      description: req.body.description ? req.body.description.trim() : null,
    });

    // ----------------------- 6 Update floor's totalSeat count -------------------------
    await Floor.findByIdAndUpdate(floorId, { $inc: { totalSeats: 1 } });

    // ----------------------- 7 Auto create update plan for this Library. Handle case where if it is new seatType ----------------------------
    await syncPlans(existingLibrary._id);

    // ----------------------- 8 Return success message ----------------------------
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
