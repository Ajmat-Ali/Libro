const { validateHoliday } = require("../../validators/library.validator");
const Library = require("../../models/library.model");
const { toDate } = require("validator");

const addHoliday = async (req, res) => {
  try {
    // 1. Validate
    const { isValid, errors } = validateHoliday(req.body);
    if (!isValid) return res.status(400).json({ errors });

    // 2. Find library
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    // 3. Check duplicate holiday date

    const holidayDate = new Date(req.body.date);
    const duplicate = library.holidays.find(
      (h) => new Date(h.date).toDateString() === holidayDate.toDateString(),
    );
    if (duplicate) {
      return res.status(409).json({
        message: "Holiday already exists for this date",
      });
    }

    // 4. Push new holiday into array
    library.holidays.push({
      date: holidayDate,
      reason: req.body.reason.trim(),
    });

    await library.save();

    return res.status(201).json({
      message: "Holiday added successfully",
      holidays: library.holidays,
    });
  } catch (error) {
    console.error("addHoliday error:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = addHoliday;
