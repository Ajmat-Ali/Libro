const StudentProfile = require("../../models/studentProfile.model");
const User = require("../../models/user.model");

const getMembersReport = async (req, res) => {
  try {
    // --------------------- Member Details -------------------
    const [approved, pending, rejected, suspended] = await Promise.all([
      StudentProfile.countDocuments({ approvalStatus: "approved" }),
      StudentProfile.countDocuments({ approvalStatus: "pending" }),
      StudentProfile.countDocuments({ approvalStatus: "rejected" }),

      User.countDocuments({ role: "student", isActive: "false" }),
    ]);

    // ------------------- New members joined this month --------------------------
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await StudentProfile.countDocuments({
      approvalStatus: "approved",
      createdAt: { $gte: firstDayOfMonth },
    });

    // ----------------------- Return Success message ----------------
    return res.status(200).json({
      total: approved + pending + rejected,
      approved,
      pending,
      rejected,
      suspended,
      newThisMonth,
    });
  } catch (error) {
    console.error("getMembersReport error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getMembersReport;
