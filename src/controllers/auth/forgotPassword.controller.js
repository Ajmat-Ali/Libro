const { validateForgotPassword } = require("../../validators/auth/index");

const User = require("../../models/user.model");
const { sendEmail } = require("../../utils/sendEmail");
const bcrypt = require("bcrypt");
const { SALT_ROUND } = require("../../constants");

const forgotPassword = async (req, res) => {
  try {
    // 1 validate email
    const { errors, isValid } = validateForgotPassword(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }
    // 2 get user from DB
    const user = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({ message: "No account found" });
    }
    // 3 Generate Otp for forgot password and expiry time
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4 Hased Otp and update user with otp and expire time of otp
    const hashedOtp = await bcrypt.hash(otp, SALT_ROUND);
    user.passwordResetOtp.code = hashedOtp;
    user.passwordResetOtp.expiresAt = expiresAt;

    await user.save();

    // 5 send OTP on Email
    try {
      await sendEmail(
        user.email,
        "Reset your password - Libro Library",
        `<h2>Your OTP is: ${otp} </h2>
      <p>This OTP will expire in 10 minutes.</p>`,
      );
    } catch (error) {
      console.error("email sending failed for forgot password:", error.message);
      return res.status(500).json({
        message: "Failed to send forgot Password email. Please try again.",
      });
    }
    // 6 send success message
    return res
      .status(200)
      .json({ message: "OTP sent successfully for Forgot password" });
  } catch (error) {
    console.error("Failed to send otp on forgot password:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = forgotPassword;
