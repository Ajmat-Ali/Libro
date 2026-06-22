const Library = require("../models/library.model");
const Seat = require("../models/seat.model");
const TimeSlot = require("../models/timeSlot.model");
const Plan = require("../models/plan.model");

// Called whenever: seat added, seat type changed, hourlyRate updated, slot created

const syncPlans = async (libraryId) => {
  try {
    const existingLibrary = await Library.findById(libraryId);
    if (!existingLibrary) return;

    // ---------------------- 2 check if library has any seats and it's type ----------------------
    const existingSeatTypes = await Seat.distinct("seatType", { libraryId });
    if (existingSeatTypes.length === 0) return;

    // ---------------------- 3 if seat exist sync plan for each type of seat --------------------
    const timeSlots = await TimeSlot.find({ libraryId, isActive: true });
    if (timeSlots.length === 0) return;

    for (const slot of timeSlots) {
      const durationHours = slot.durationMinutes / 60;

      for (const seatType of existingSeatTypes) {
        const rate = existingLibrary.hourlyRates[seatType];

        const calculatedPrice = Math.round(rate * durationHours);

        await Plan.findOneAndUpdate(
          {
            libraryId,
            timeSlotId: slot._id,
            seatType,
          },
          {
            name: `${seatType} - ${slot.name}`,
            durationType: "monthly",
            calculatedPrice,
            isActive: true,
          },
          { upsert: true, returnDocument: "after" },
        );
      }
    }
  } catch (error) {
    console.error("Error while creating Plan", error.message);
  }
};

module.exports = syncPlans;
