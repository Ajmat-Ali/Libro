const { ROLES } = require("../../constants");
const User = require("../../models/user.model");
const mongoose = require("mongoose");

const deactivateGuard = async (req, res) => {
  try {
    const { id: guardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(guardId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // 1 find guard by ID
    const existingGuard = await User.findById(guardId);

    if (!existingGuard) {
      return res.status(404).json({ message: "No guard found" });
    }

    // 2 check role is guard
    if (existingGuard.role !== ROLES.GUARD) {
      return res.status(400).json({ message: "THis is not guard account" });
    }

    // 3 check guard already deactivated or not
    if (!existingGuard.isActive) {
      return res.status(400).json({ message: "Guard is already deactivated" });
    }

    // 4 Clear all refresh Token
    existingGuard.isActive = false;
    existingGuard.refreshTokens = [];

    await existingGuard.save();

    // 5 return success message
    return res.status(200).json({ message: "Guard deactivated successfully" });
  } catch (error) {
    console.error("Failed to deactivate Guard:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = deactivateGuard;
