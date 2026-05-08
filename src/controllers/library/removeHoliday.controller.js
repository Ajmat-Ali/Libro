const Library = require("../../models/library.model");

const removeHoliday = async (req, res) => {
  try {
    // 1. Find library
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    // 2. Find holiday by id inside array
    const holiday = library.holidays.id(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    // 3. Remove holiday
    holiday.deleteOne();
    await library.save();

    return res.status(200).json({
      message: "Holiday removed successfully",
      holidays: library.holidays,
    });
  } catch (error) {
    console.error("removeHoliday error:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = removeHoliday;
