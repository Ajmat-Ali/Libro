const Library = require("../../models/library.model");
const Floor = require("../../models/floor.model");
const Seat = require("../../models/seat.model");
const Booking = require("../../models/booking.model");

const deleteSeat = async (req, res) => {
  try {
    // --- 1 Get floorId, seatId --------------
    const { floorId, seatId } = req.params;

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

    // ----------- 5 cannot delete seat with active or pending bookings -------------------
    const blockBooking = await Booking.findOne({
      seatId: existingSeat,
      status: { $in: ["active", "pending"] },
    });
    if (blockBooking) {
      return res.status(400).json({
        message:
          "Cannot delete seat. It has active or pending bookings. Cancel them first.",
      });
    }

    // ----------- 6 delete seat -----------------
    await Seat.findByIdAndDelete(existingSeat._id);

    // ----------- 7 Update floor's totalSeats --------------------------
    await Floor.findByIdAndUpdate(floorId, { $inc: { totalSeats: -1 } });

    // ----------- 8 Update floor's totalSeats --------------------------
    return res.status(200).json({ message: "Seat deleted successfully." });
  } catch (error) {
    console.error("deleteSeat error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = deleteSeat;
