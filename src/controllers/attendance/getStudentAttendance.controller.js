const Library = require("../../models/library.model");

const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    // ---------------------- Get Library ---------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------------ Validate pagination data  ---------------
    const { page = 1, limit = 30 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // --------------------------- Get total Attendance count -----------------
    const total = await Attendance.countDocuments({
      libraryId: library._id,
      studentId: studentId,
    });

    // --------------------------- Get Record ------------------------
    const records = await Attendance.find({
      libraryId: library._id,
      studentId: studentId,
    })
      .populate("timeSlotId", "name startTimeDisplay endTimeDisplay")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    // --------------------------- Return success message --------------
    return res.status(200).json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      records,
    });
  } catch (error) {
    console.error("getStudentAttendance error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getStudentAttendance;
