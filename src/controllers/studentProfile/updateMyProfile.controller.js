const StudentProfile = require("../../models/studentProfile.model");
const User = require("../../models/user.model");
const { validateUpdateMember } = require("../../validators/member.validator");

const updateMyProfile = async (req, res) => {
  try {
    // -------------- Validate Request Body ---------------
    const { errors, isValid } = validateUpdateMember(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // ----------------------- Find User ---------------------
    const user = await User.findById(req.user._id);
    const profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!user || !profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    // ----------------------   Phone change → check uniqueness --------------------
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
          .json({ message: "Phone number already in use by another account." });
      }
      user.phone = req.body.phone.trim();
      profile.phone = req.body.phone.trim();
    }

    // ------------------------ Update User field ---------------------------
    if (req.body.firstName !== undefined)
      user.firstName = req.body.firstName.trim();
    if (req.body.lastName !== undefined) {
      user.lastName = req.body.lastName ? req.body.lastName.trim() : "";
    }

    if (req.body.address !== undefined) {
      profile.address = req.body.address ? req.body.address.trim() : null;
    }

    // -------------------- Save both at same time ----------------------
    await Promise.all([user.save(), profile.save()]);

    // -------------------- Return success message ------------------------
    return res.status(200).json({
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("updateMyProfile error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = updateMyProfile;
