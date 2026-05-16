const Attendance = require("../../models/attendance.model");
const Library = require("../../models/library.model");

const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    // ------------------------ Get month and year from query (default = current month) -------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------------ Find attendance ---------------------
    const attendance = await Attendance.findOne({
      _id: attendanceId,
      libraryId: library._id,
    });

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    // ------------------------ Block deletion of QR scan attendance ---------------------
    if (attendance.markedHow === "qr_scan") {
      return res.status(403).json({
        message:
          "Cannot delete QR scan attendance. Only manually marked attendance can be deleted.",
      });
    }

    // ------------------------ Find by Id and delete attendance -----------------

    await Attendance.findByIdAndDelete(attendance._id);

    return res.status(200).json({
      message: "Attendance record deleted successfully.",
    });

    // ------------------------
  } catch (error) {
    console.error("deleteAttendance error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
module.exports = deleteAttendance;
