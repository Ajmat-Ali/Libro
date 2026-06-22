const StudentProfile = require("../../models/studentProfile.model");
const generateMembershipId = require("../../utils/generateMembershipId");

const reviewMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { action, rejectionReason } = req.body;

    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({
        message: "action must be either 'approve' or 'reject'",
      });
    }

    if (
      action === "reject" &&
      (!rejectionReason || rejectionReason.trim() === "")
    ) {
      return res.status(400).json({
        message: "rejectionReason is required when rejecting a member.",
      });
    }

    const profile = await StudentProfile.findOne({
      _id: memberId,
    });
    if (!profile) {
      return res.status(404).json({ message: "Member not found." });
    }

    if (profile.approvalStatus !== "pending") {
      return res.status(400).json({
        message: `Member is already ${profile.approvalStatus}. Cannot review again.`,
      });
    }

    if (action === "approve") {
      profile.approvalStatus = "approved";
      profile.membershipId = generateMembershipId();
      profile.reviewedBy = req.user.id;
      profile.reviewedAt = new Date();
      profile.rejectionReason = null;

      await profile.save();

      return res.status(200).json({
        message: "Member approved successfully.",
        membershipId: profile.membershipId,
      });
    }

    profile.approvalStatus = "rejected";
    profile.reviewedBy = req.user.id;
    profile.reviewedAt = new Date();
    profile.rejectionReason = rejectionReason.trim();

    await profile.save();

    return res.status(200).json({
      message: "Member rejected.",
      rejectionReason: profile.rejectionReason,
    });
  } catch (error) {
    console.error("reviewMember error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = reviewMember;
