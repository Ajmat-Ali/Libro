const Floor = require("../../models/floor.model");
const Library = require("../../models/library.model");
const Seat = require("../../models/seat.model");

const { validateCreateSeat } = require("../../validators/seat.validator");
const syncPlans = require("../../utils/syncPlans");

const bulkCreateSeat = async (req, res) => {
  try {
    // ------------------------ Get floorId from req.params -----
    const { floorId } = req.params;

    // console.log(req.body);

    // ------------------ 1 Validate bulk seat to check is it array or not -------------------
    if (!Array.isArray(req.body.seats) || req.body.seats.length === 0) {
      return res
        .status(400)
        .json({ message: "seats must be a non-empty array." });
    }

    // ------------------- 1.1 -----------------
    if (req.body.seats.length > 100) {
      return res
        .status(400)
        .json({ message: "Cannot add more than 100 seats at once." });
    }

    // ----------------------- 2 check existing Library and floor ----------------------------
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary)
      return res.status(404).json({ message: "Library not found" });

    // ----------------------- 3 check existing Library and floor ----------------------------

    const existingFloor = await Floor.findOne({
      _id: floorId,
      libraryId: existingLibrary._id,
    });

    if (!existingFloor)
      return res.status(404).json({ message: "Floor not found" });

    const created = [];
    const failed = [];

    for (const seatData of req.body.seats) {
      // --------------------- 4 validate each seat ---------------------------------------------
      const { errors, isValid } = validateCreateSeat(seatData);
      if (!isValid) {
        failed.push({
          seatLabel: seatData.seatLabel || "unkmown",
          reason: Object.keys(errors)[0],
        });
        continue;
      }

      // --------------------- 5 Check duplicate ---------------------------------------------
      const seatLabel = seatData.seatLabel.trim().toUpperCase();
      const duplicate = await Seat.findOne({ floorId, seatLabel });
      if (duplicate) {
        failed.push({
          seatLabel,
          reason: "Already exists on this floor.",
        });
        continue;
      }

      //   ------------------------ 6 Create seat -----------------------
      try {
        const seat = await Seat.create({
          floorId,
          libraryId: existingLibrary._id,
          seatLabel,
          seatType: seatData.seatType.trim().toLowerCase() || "general",
          description: seatData.description
            ? seatData.description.trim()
            : null,
        });

        created.push(seat);
      } catch (error) {
        console.log(error);
        failed.push({ seatLabel, reason: "Failed to create seat." });
      }
    }

    // -------------------- 7 Update totalSeat of floor's and call auto Plan -------------------------
    if (created.length > 0) {
      await Floor.findByIdAndUpdate(floorId, {
        $inc: { totalSeats: created.length },
      });
      await syncPlans(existingLibrary._id);
    }

    // ------------------------ 8 Success message ----------------------------
    return res.status(201).json({
      message: `${created.length} seat(s) created. ${failed.length} failed.`,
      created: created.length,
      failed: failed.length,
      failedDetails: failed,
    });
  } catch (error) {
    console.error("bulkCreateSeats error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = bulkCreateSeat;
