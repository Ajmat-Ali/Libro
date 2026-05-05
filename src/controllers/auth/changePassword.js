const { SALT_ROUND } = require("../../constants");
const User = require("../../models/user.model");
const validateChangePassword = require("../../validators/auth/validateChangePassword");
const bcrypt = require("bcrypt");

const changePassword = async (req, res) => {
  try {
    // validate current pass, new pass & confirm Pass
    const { errors, isValid } = validateChangePassword(req.body);

    if (!isValid) {
      return res.status(400).json({ errors });
    }
    // 2 Check current pass must not be equal to new pass
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // 3 Get user from DB for password
    const user = await User.findById(req.user._id);

    // 4 compare current pass with stored pass
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Please enter correct password" });
    }

    // 5 hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUND);

    // 6 clear all refresh token expect current device
    const { refreshToken: incomingRefreshToken } = req.cookies;
    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const validTokens = user.refreshTokens.filter(
      (token) => token === incomingRefreshToken,
    );

    // update user Password and refresh token as well
    user.password = hashedNewPassword;
    user.refreshTokens = validTokens;

    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Failed to change password:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = changePassword;
