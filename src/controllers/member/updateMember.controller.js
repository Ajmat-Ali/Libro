const User = require("../../models/user.model");
const { validateUpdateMember } = require("../../validators/member.validator");
const { ROLES } = require("../../constants/index");
const StudentProfile = require("../../models/studentProfile.model");

const updateMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    // ------------------ 1 Validate input ------------------------------
    const { isValid, errors } = validateUpdateMember(req.body);
    if (!isValid) return res.status(400).json({ errors });

    // -------------------------- 2 find user and it's profile  -------------------------------------------
    const user = await User.findOne({
      _id: memberId,
      role: ROLES.STUDENT,
    });
    if (!user) {
      return res.status(404).json({ message: "Member not found." });
    }

    const profile = await StudentProfile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: "Member profile not found." });
    }
    // -------------------------- 3 Phone change -> check uniqueness-------------------------------------------
    if (
      req.body.phone !== undefined &&
      req.body.phone.trim() !== profile.phone
    ) {
      const existingPhone = await StudentProfile.findOne({
        phone: req.body.phone.trim(),
        _id: { $ne: profile._id },
      });
      if (existingPhone) {
        return res
          .status(409)
          .json({ message: "Phone number already in use." });
      }
      profile.phone = req.body.phone.trim();
      user.phone = req.body.phone.trim(); // keep in sync
    }

    // -------------------------- 4 Update User fields -------------------------------------------
    if (req.body.firstName !== undefined)
      user.firstName = req.body.firstName.trim();
    if (req.body.lastName !== undefined)
      user.lastName = req.body.lastName ? req.body.lastName.trim() : "";

    // Update Profile fields
    if (req.body.address !== undefined) {
      profile.address = req.body.address ? req.body.address.trim() : null;
    }

    // -------------------------- 5 save user and studentProfile together -------------------------------------------
    await Promise.all([user.save(), profile.save()]);

    // -------------------------- 6 return success message -------------------------------------------
    return res.status(200).json({
      message: "Member details updated successfully.",
    });
  } catch (error) {
    console.error("updateMember error:", err.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = updateMember;
