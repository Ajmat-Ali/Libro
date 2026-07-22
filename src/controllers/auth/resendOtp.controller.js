const { validateResendOtp } = require("../../validators/auth/index");
const User = require("../../models/user.model");
const StudentProfile = require("../../models/studentProfile.model");
const bcrypt = require("bcrypt");
const { SALT_ROUND } = require("../../constants/index");
const { sendEmail } = require("../../utils/sendEmail");

const resendOtp = async (req, res) => {
  try {
    // 1. Validate Input Email
    const { errors, isValid } = validateResendOtp(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // 2. find studnet by email in user collection.
    const student = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });
    if (!student) {
      return res
        .status(404)
        .json({ message: "No account found, Please Register!" });
    }

    // 3. Find studentProfile. to check already verified
    const studentProfile = await StudentProfile.findOne({
      userId: student._id,
    });
    if (!studentProfile) {
      return res.status(404).json({ message: "Student Profile not found" });
    }

    // 4. check is email already verified
    if (studentProfile.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // 5 Generate New Otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // 6 Hashed otp
    const hashedOtp = await bcrypt.hash(otp, SALT_ROUND);

    // 7. calculate new Expire time 10 minutes.
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 8 update student profile with new otp and expire time
    studentProfile.emailOtp.code = hashedOtp;
    studentProfile.emailOtp.expiresAt = expiresAt;

    await studentProfile.save();

    // 9 Send OTP
    try {
      await sendEmail(
        req.body.email,
        "Verify your email - Libro Library",
        `<h2>Your OTP is: ${otp} </h2>
      <p>This OTP will expire in 10 minutes.</p>`,
      );
    } catch (error) {
      console.log("Failed to send Email" + error.message);
      return res
        .status(500)
        .json({ message: "Something went wrong, Please try again later" });
    }

    return res
      .status(200)
      .json({
        message: "OTP resent successfully",
        ...(process.env.SHOW_OTP_IN_RESPONSE === "true" && { devOtp: otp }),
      });
  } catch (error) {
    console.log("Failed to send otp " + error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};

module.exports = { resendOtp };
