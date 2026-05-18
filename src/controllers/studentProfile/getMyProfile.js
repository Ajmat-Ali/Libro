const StudentProfile = require("../../models/studentProfile.model");
const User = require("../../models/user.model");

const getMyProfile = async (req, res) => {
  try {
    // ---------------------- Get user and profile -------------
    const [user, profile] = await Promise.all([
      User.findById(req.user.id).select("-password -refreshTokens -__v"),
      StudentProfile.findOne({ userId: req.user.id }).select("-emailOtp -__v"),
    ]);
    if (!user || !profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    // ------------------- Return Success message --------------------
    return res.status(200).json({
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        // StudentProfile fields
        membershipId: profile.membershipId,
        address: profile.address,
        photo: profile.photo,
        idProof: profile.idProof,
        approvalStatus: profile.approvalStatus,
        isEmailVerified: profile.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("getMyProfile error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getMyProfile;
