const User = require("../../models/user.model");
const { ROLES } = require("../../constants/index");
const QRCode = require("../../models/qrCode.model");

const toggleMemberStatus = async (req, res) => {
  try {
    const { memberId } = req.params;

    // ------------- 1 Get user (Only student) -----------------
    const user = await User.findOne({
      _id: memberId,
      role: ROLES.STUDENT,
    });
    if (!user) {
      return res.status(404).json({ message: "Member not found." });
    }

    // ---------- 2 Cannot suspend the owner -----------------
    if (user.role === ROLES.OWNER) {
      return res.status(403).json({ message: "Cannot suspend the owner." });
    }

    // ---------------- 3 Toggle status ------------------------------
    user.isActive = !user.isActive;

    // ----------------- 4 cancel all OR code ----------------------------
    if (!user.isActive) {
      // SUSPEND: clear all sessions instantly
      user.refreshTokens = [];

      // Revoke all active QR codes immediately
      await QRCode.updateMany(
        { studentId: user._id, status: "active" },
        {
          status: "revoked",
          revokedAt: new Date(),
          revokedBy: req.user.id,
          revokeReason: "student_suspended",
        },
      );
    }

    await user.save();

    return res.status(200).json({
      message: `Member ${user.isActive ? "reactivated" : "suspended"} successfully.`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("toggleMemberStatus error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = toggleMemberStatus;
