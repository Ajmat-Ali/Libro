const { validateUpdateSeat } = require("../../validators/seat.validator");
const Library = require("../../models/library.model");
const Floor = require("../../models/floor.model");
const Seat = require("../../models/seat.model");
const syncPlans = require("../../utils/syncPlans");

const updateSeat = async (req, res) => {
  try {
    const { floorId, seatId } = req.params;

    // ----------- Validate input ------------------
    const { errors, isValid } = validateUpdateSeat(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // -------------- 2 get library -----------------------------
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary)
      return res.status(404).json({ message: "Library not found" });

    // ----------------- 3 get Floor --------------
    const existingFloor = await Floor.findOne({
      _id: floorId,
      libraryId: existingLibrary._id,
    });
    if (!existingFloor)
      return res.status(404).json({ message: "Floor not found" });

    // -------------- 4 get Seat----------------------------
    const existingSeat = await Seat.findOne({
      _id: seatId,
      floorId,
    });
    if (!existingSeat)
      return res.status(404).json({ message: "Seat not found" });

    // -------------- 5 if seatLabel changing check for duplicate and update other fields -----------------
    if (req.body.seatLabel !== undefined) {
      const newLabel = req.body.seatLabel.trim().toUpperCase();
      if (newLabel !== existingSeat.seatLabel) {
        const duplicate = await Seat.findOne({
          floorId,
          seatLabel: newLabel,
          id: { $ne: existingSeat._id },
        });
        if (duplicate) {
          return res.status(409).json({
            message: `Seat ${newLabel} already exists on this floor.`,
          });
        }
        existingSeat.seatLabel = newLabel;
      }
    }
    if (req.body.seatType !== undefined) {
      existingSeat.seatType = req.body.seatType.trim().toLowerCase();
    }
    if (req.body.description !== undefined) {
      existingSeat.description = req.body.description
        ? req.body.description.toString().trim()
        : null;
    }

    await existingSeat.save();

    // ---------------- 6 call syncPlans for plan creation -----------------
    await syncPlans(existingLibrary._id);

    // ---------------- 7 call syncPlans for plan creation -----------------
    return res.status(200).json({
      message: "Seat updated successfully.",
      seat: existingSeat,
    });
  } catch (error) {
    console.error("updateSeat error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = updateSeat;
