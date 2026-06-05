const { validateResetPassword } = require("../../validators/auth/index");
const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const { SALT_ROUND } = require("../../constants");

const resetPassword = async (req, res) => {
  try {
    // validate email, password and otp
    const { errors, isValid } = validateResetPassword(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }
    // 2 Get user from req.user
    const user = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });
    if (!user) {
      return res.status(404).json({ message: "No account found" });
    }

    // 3 check whether user has request OTP or not
    if (!user.passwordResetOtp.code) {
      return res

        .status(400)
        .json({ message: "Please request a new OTP first" });
    }

    // 3.1 check expires time for OTP
    if (user.passwordResetOtp.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 4 compare otp for verification
    const isValidOtp = await bcrypt.compare(
      req.body.otp.trim(),
      user.passwordResetOtp.code,
    );
    if (!isValidOtp) {
      return res.status(404).json({ message: "Invalid OTP" });
    }

    // 5 clear all refresh Token
    const { refreshToken: incomingRefreshToken } = req.cookies;

    const validTokens = user.refreshTokens.filter(
      (token) => token === incomingRefreshToken,
    );

    // 6 hashed Password
    const hashedPassword = await bcrypt.hash(req.body.newPassword, SALT_ROUND);

    // 6.1 Update user with password and refresh Token
    user.password = hashedPassword;
    user.passwordResetOtp.code = null;
    user.passwordResetOtp.expiresAt = null;
    user.refreshTokens = validTokens;

    await user.save();

    // 7 return success message
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Failed to reset Password:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong to reset password" });
  }
};

module.exports = resetPassword;
