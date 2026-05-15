const EntryLog = require("../../models/entryLog.model");
const Library = require("../../models/library.model");

const getAllEntryLogs = async (req, res) => {
  try {
    // ------------------- GEt Library --------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ----------------------- Extract all variable from query -------------------------
    const { scanResult, guardId, date, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // ----------------------- Get all Filter ----------
    const filter = { libraryId: library._id };

    if (scanResult) filter.scanResult = scanResult;
    if (guardId) filter.scannedBy = guardId;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filter.scanTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const total = await EntryLog.countDocuments(filter);

    // ----------------------- Get Entry logs --------------------
    const logs = await EntryLog.find(filter)
      .populate("studentId", "firstName lastName")
      .populate("scannedBy", "firstName lastName")
      .sort({ scanTime: -1 })
      .skip(skip)
      .limit(limitNum);

    // ----------------------- Success message ----------------
    return res.status(200).json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      logs,
    });
  } catch (error) {
    console.error("getAllEntryLogs error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getAllEntryLogs;
