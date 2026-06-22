const { validateCreateSlot } = require("../../validators/slot.validator");
const timeToMinutes = require("../../utils/timeToMinutes");
const minutesToDisplay = require("../../utils/minutesToDisplay ");
const Library = require("../../models/library.model");
const TimeSlot = require("../../models/timeSlot.model");
const syncPlans = require("../../utils/syncPlans");

const createSlot = async (req, res) => {
  try {
    const { errors, isValid } = validateCreateSlot(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({
        message: "Library not found. Please set up your library first.",
      });
    }

    const startTimeMinutes = timeToMinutes(req.body.startTime);
    let endTimeMinutes = timeToMinutes(req.body.endTime);

    if (endTimeMinutes < startTimeMinutes) {
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

    const existingSlots = await TimeSlot.find({
      libraryId: existingLibrary._id,
    });
    if (existingSlots) {
      for (const slotData of existingSlots) {
        if (
          startTimeMinutes >= slotData.startTimeMinutes &&
          startTimeMinutes <= slotData.endTimeMinutes
        ) {
          return res.status(409).json({
            message: `Can't create slot. start time conflicting to slot ${slotData.name} `,
          });
        }
        if (
          endTimeMinutes >= slotData.startTimeMinutes &&
          endTimeMinutes <= slotData.endTimeMinutes
        ) {
          return res.status(409).json({
            message: `Can't create slot. end time conflicting to slot ${slotData.name} `,
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

    // ----------------------- 6 Build display String ------------------------------------
    const startTimeDisplay = minutesToDisplay(startTimeMinutes);
    const endTimeDisplay =
      endTimeMinutes > 1439
        ? `${minutesToDisplay(endTimeMinutes)} (next Day)`
        : minutesToDisplay(endTimeMinutes);

    // ----------------------- 7 Create slot ------------------------------------
    const slot = await TimeSlot.create({
      libraryId: existingLibrary._id,
      name: req.body.name.trim(),
      startTimeMinutes,
      endTimeMinutes,
      durationMinutes,
      startTimeDisplay,
      endTimeDisplay,
      isActive: true,
    });

    // ----------------------- 8 Auto create Plan ------------------------------------
    await syncPlans(existingLibrary._id);

    // ----------------------- 9 Send success message  ------------------------------------
    return res.status(201).json({
      message: "Time slot created successfully.",
      slot,
    });
  } catch (error) {
    console.error("Error creating slot:", error.message);
    return res
      .status(500)
      .json({ message: "something went wrong to create slot" });
  }
};

module.exports = createSlot;
