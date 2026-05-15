const EntryLog = require("../../models/entryLog.model");
const Library = require("../../models/library.model");

const getStudentEntryHistory = async (req, res) => {
  try {
    const { memberId } = req.params;

    // ----------------------  Get Library  ------------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // ---------------------- Get Total Count and Entry Log   ------------------------
    const total = await EntryLog.countDocuments({
      libraryId: library._id,
      studentId: memberId,
    });

    const logs = await EntryLog.find({
      libraryId: library._id,
      studentId: memberId,
    })
      .populate("scannedBy", "firstName lastName")
      .sort({ scanTime: -1 })
      .skip(skip)
      .limit(limitNum);

    // ---------------------- Return Success message ------------------------
    return res.status(200).json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      logs,
    });
  } catch (error) {
    console.error("getStudentEntryHistory error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getStudentEntryHistory;
