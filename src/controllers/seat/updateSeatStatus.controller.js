const Library = require("../../models/library.model");
const Floor = require("../../models/floor.model");
const Seat = require("../../models/seat.model");
const Booking = require("../../models/booking.model");

const { VALID_STATUSES } = require("../../constants/index");

const updateSeatStatus = async (req, res) => {
  try {
    // ------------- 1 get floorId, seatId ----------------
    const { floorId, seatId } = req.params;

    // -------------- 1.1 Validate status -----------------
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({ errors: { status: "Status is required" } });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        errors: {
          status: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
        },
      });
    }

    // ------------- 2 Get Library ----------------------
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary)
      return res.status(404).json({ message: "Library not found" });

    // ------------- 3 Get floor -----------------------
    const existingFloor = await Floor.findOne({
      _id: floorId,
      libraryId: existingLibrary._id,
    });
    if (!existingFloor)
      return res.status(404).json({ message: "Floor not found" });

    // ------------- 4  get seat ------------------------------
    const existingSeat = await Seat.findOne({
      _id: seatId,
      floorId,
    });
    if (!existingSeat)
      return res.status(404).json({ message: "Seat not found" });

    // ------------- 5 Can't be "maintenance",  "disabled" if it has alreadt active bookin ------------
    if (status === "maintenance" || status === "disabled") {
      const activeBooking = await Booking.findOne({
        seatId: existingSeat._id,
        status: "active",
      });
      if (activeBooking) {
        return res.status(400).json({
          message: `Cannot set seat to "${status}". It has an active booking. Cancel the booking first.`,
        });
      }
    }

    // ------------------- 6 Update Seat status ----------------------
    existingSeat.status = status;
    existingSeat.statusUpdatedBy = req.user.id;
    existingSeat.statusUpdatedAt = new Date();
    existingSeat.statusReason = reason ? reason.toString().trim() : null;

    await existingSeat.save();

    // ------------------- 7 Success message ----------------------
    return res.status(200).json({
      message: `Seat status updated to ${status} successfully.`,
      seat: existingSeat,
    });
  } catch (error) {
    console.error("updateSeatStatus error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = updateSeatStatus;
