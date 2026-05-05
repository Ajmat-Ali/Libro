const { validateVerifyEmail } = require("../../validators/auth/index");
const User = require("../../models/user.model");
const StudentProfile = require("../../models/studentProfile.model");
const bcrypt = require("bcrypt");

const verifyEmail = async (req, res) => {
  try {
    //1. validate email and otp
    const { errors, isValid } = validateVerifyEmail(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // 2. check is user already register
    const student = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });

    if (!student) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    // 3. check email is `verified` --> `emailOtp != null` --> `emailOtp.expiresAt`
    const studentProfile = await StudentProfile.findOne({
      userId: student._id,
    });

    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // 3.1. check email is verified or not
    if (studentProfile.isEmailVerified) {
      return res.status(409).json({ message: "Email already verified" });
    }

    // 3.2 check emailOtp.code is null
    if (!studentProfile.emailOtp.code) {
      return res
        .status(400)
        .json({ message: "Please request a new OTP first" });
    }

    // 3.3 check if otp expired
    if (studentProfile.emailOtp.expiresAt < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one" });
    }

    // 4. Compare the otp with bcrypt.compare
    const isValidOtp = await bcrypt.compare(
      req.body.otp,
      studentProfile.emailOtp.code,
    );
    if (!isValidOtp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // 5. Make email as verified and update studentProfile
    studentProfile.isEmailVerified = true;
    studentProfile.emailOtp.code = null;
    studentProfile.emailOtp.expiresAt = null;

    await studentProfile.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log(`Error: Failed to verify ${error.message}`);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = { verifyEmail };
