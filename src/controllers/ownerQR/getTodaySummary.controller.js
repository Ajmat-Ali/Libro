const EntryLog = require("../../models/entryLog.model");
const Library = require("../../models/library.model");

const getTodaySummary = async (req, res) => {
  try {
    // ----------------------- GEt Library --------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------ Get Entry log  ----------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [successCount, failedCount, recentLogs] = await Promise.all([
      EntryLog.countDocuments({
        libraryId: library._id,
        scanResult: "success",
        scanTime: { $gte: today, $lt: tomorrow },
      }),

      EntryLog.countDocuments({
        libraryId: library._id,
        scanResult: "failed",
        scanTime: { $gte: today, $lt: tomorrow },
      }),

      EntryLog.find({
        libraryId: library._id,
        scanTime: { $gte: today, $lt: tomorrow },
      })
        .populate("studentId", "firstName lastName")
        .populate("scannedBy", "firstName lastName")
        .sort({ scanTime: -1 })
        .limit(10),
    ]);

    // -------------------------- Return Success message --------------------------
    return res.status(200).json({
      today: {
        successful: successCount,
        failed: failedCount,
        total: successCount + failedCount,
      },
      recentScans: recentLogs,
    });
  } catch (error) {
    console.error("getTodaySummary error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getTodaySummary;
