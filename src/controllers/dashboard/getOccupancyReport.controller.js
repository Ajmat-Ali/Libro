const Booking = require("../../models/booking.model");
const Floor = require("../../models/floor.model");
const Library = require("../../models/library.model");
const Seat = require("../../models/seat.model");
const TimeSlot = require("../../models/timeSlot.model");

const getOccupancyReport = async (req, res) => {
  try {
    // ---------------------- Get Library ---------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------ Get all floors with their seats -------------------
    const now = new Date();

    const floors = await Floor.find({
      libraryId: library._id,
      isActive: true,
    });

    // ------------------ For each floor → count total seats and occupied seats -------------------
    const floorReport = await Promise.all(
      floors.map(async (floor) => {
        const totalSeats = await Seat.countDocuments({
          floorId: floor._id,
          status: "active",
        });
        // Occupied = active booking for a seat on this floor right now
        const seatsOnFloor = await Seat.find({
          floorId: floor._id,
        }).select("_id");

        const seatIds = seatsOnFloor.map((s) => s._id);

        const occupiedSeats = await Booking.countDocuments({
          seatId: { $in: seatIds },
          status: "active",
          startDate: { $lte: now },
          endDate: { $gte: now },
        });

        return {
          floorName: floor.name,
          floorNumber: floor.number,
          totalSeats,
          occupiedSeats,
          availableSeats: totalSeats - occupiedSeats,
          occupancyRate:
            totalSeats > 0
              ? `${Math.round((occupiedSeats / totalSeats) * 100)}%`
              : "0%",
        };
      }),
    );

    // -------------------- Slot-wise occupancy -----------------
    const slots = await TimeSlot.find({
      libraryId: library._id,
      isActive: true,
    });

    const slotReport = await Promise.all(
      slots.map(async (slot) => {
        const seats = await Booking.countDocuments({
          libraryId: library._id,
          timeSlotId: slot._id,
          status: "active",
          startDate: { $lte: now },
          endDate: { $gte: now },
        });

        return {
          slotName: slot.name,
          slotTime: `${slot.startTimeDisplay} - ${slot.endTimeDisplay}`,
          activeBookings: bookingsForSlot,
        };
      }),
    );

    // ------------------ Return response -----------
    return res.status(200).json({
      byFloor: floorReport,
      bySlot: slotReport,
    });
  } catch (error) {
    console.error("getOccupancyReport error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOccupancyReport;

// COntinue To test api in postman then build other left api
