const { validateUpdateSlot } = require("../../validators/slot.validator");
const Library = require("../../models/library.model");
const TimeSlot = require("../../models/timeSlot.model");
const Booking = require("../../models/booking.model");
const timeToMinutes = require("../../utils/timeToMinutes");
const minutesToDisplay = require("../../utils/minutesToDisplay ");
const syncPlans = require("../../utils/syncPlans");

const updateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    // -------------------1 Validate input ----------------
    const { isValid, errors } = validateUpdateSlot(req.body);
    if (!isValid) return res.status(400).json({ errors });

    // -------------------2 Get Librray----------------
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not found." });
    }
    // -------------------3 Get Slot ----------------
    const existingSlot = await TimeSlot.findOne({
      _id: slotId,
      libraryId: existingLibrary._id,
    });
    if (!existingSlot)
      return res.status(404).json({ message: "Slot not found." });

    // -------------------4 check slot has ["active", "pending"] booking -------------------------------
    const timesChanging =
      req.body.startTime !== undefined || req.body.endTime !== undefined;

    if (timesChanging) {
      const bookingExists = await Booking.findOne({
        timeSlotId: existingSlot._id,
        status: { $in: ["active", "pending"] },
      });

      if (bookingExists) {
        return res.status(400).json({
          message:
            "Cannot update slot times. Active or pending bookings exist for this slot. Only the name can be updated.",
        });
      }
    }

    // -------------------------5 Update name and time -----------------------------------------
    if (req.body.name !== undefined || req.body.name.trim() !== "") {
      existingSlot.name = req.body.name.trim();
    }

    if (timesChanging) {
      let startTimeMinutes;
      if (req.body.startTime !== undefined) {
        startTimeMinutes = timeToMinutes(req.body.startTime);
      } else {
        startTimeMinutes = existingSlot.startTimeMinutes;
      }

      let endTimeMinutes =
        req.body.endTime !== undefined
          ? timeToMinutes(req.body.endTime)
          : existingSlot.endTimeMinutes;

      if (endTimeMinutes <= startTimeMinutes) {
        endTimeMinutes += 1440;
      }

      const durationMinutes = endTimeMinutes - startTimeMinutes;

      if (durationMinutes < 30) {
        return res.status(400).json({
          message: "Slot duration must be at least 30 minutes.",
        });
      }

      if (startTimeMinutes < existingLibrary.timings.openingTimeMinutes) {
        return res.status(400).json({
          message: `Slot cannot start before library opening time (${existingLibrary.timings.openingTime}).`,
        });
      }
      if (endTimeMinutes > existingLibrary.timings.closingTimeMinutes) {
        return res.status(400).json({
          message: `Slot cannot end after library closing time (${existingLibrary.timings.closingTime}).`,
        });
      }

      // -------------------6 Check conflict and duplication ----------------
      const allSlots = await TimeSlot.find({ libraryId: existingLibrary._id });
      if (allSlots) {
        for (const slotData of allSlots) {
          if (slotData._id.toString() === existingSlot._id.toString()) {
            continue;
          }
          if (
            startTimeMinutes >= slotData.startTimeMinutes &&
            startTimeMinutes <= slotData.endTimeMinutes
          ) {
            return res
              .status(409)
              .json({ message: `Start time conflict with ${slotData.name}` });
          }
          if (
            endTimeMinutes >= slotData.startTimeMinutes &&
            endTimeMinutes <= slotData.endTimeMinutes
          ) {
            return res.status(409).json({
              message: `End time conflict with ${(slotData.name, slotData._id)}`,
            });
          }
          if (
            slotData.startTimeMinutes >= startTimeMinutes &&
            slotData.endTimeMinutes <= endTimeMinutes
          ) {
            return res.status(409).json({
              message: `Can't create slot. Slot conflict ${slotData.name} already exist in between`,
            });
          }
        }
      }

      // -------------------7 Update document ----------------------------
      existingSlot.startTimeMinutes = startTimeMinutes;
      existingSlot.endTimeMinutes = endTimeMinutes;
      existingSlot.durationMinutes = durationMinutes;
      existingSlot.startTimeDisplay = minutesToDisplay(startTimeMinutes);
      existingSlot.endTimeDisplay =
        endTimeMinutes > 1439
          ? `${minutesToDisplay(endTimeMinutes)} (next day)`
          : minutesToDisplay(endTimeMinutes);
    }

    await existingSlot.save();

    // -------------------7 create Auto Plan  ----------------
    if (timesChanging) {
      await syncPlans(existingLibrary._id);
    }
    // -------------------8 Return success message  ----------------
    return res.status(200).json({
      message: "Slot updated successfully.",
      slot: existingSlot,
    });
  } catch (error) {
    console.error("updateSlot error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = updateSlot;
