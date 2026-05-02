const {
  validateRegisterOwner,
  validateRegisterStudent,
  validateVerifyEmail,
} = require("../validators/auth.validator");
const User = require("../models/user.model");
const { ROLES } = require("../constants/index.js");
const bcrypt = require("bcrypt");
const StudentProfile = require("../models/studentProfile.model");
const { sendEmail } = require("../utils/sendEmail.js");

const SALT_ROUND = 10;

//  Owner Registration  _________________________________________________
const registerOwner = async (req, res) => {
  try {
    const { errors, isValid } = validateRegisterOwner(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const existingOwner = await User.findOne({ role: ROLES.OWNER });
    if (existingOwner) {
      return res.status(403).json({
        message:
          "An owner account already exists. Multiple owners are not allowed.",
      });
    }

    const existingEmail = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already in use.",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUND);

    const owner = await User.create({
      firstName: req.body.firstName.toLowerCase().trim(),
      lastName: req.body.lastName ? req.body.lastName.toLowerCase().trim() : "",
      email: req.body.email.toLowerCase().trim(),
      password: hashedPassword,
      role: ROLES.OWNER,
    });

    return res.status(201).json({
      message: "Owner registered successfully",
      user: {
        id: owner._id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
        role: owner.role,
      },
    });
  } catch (error) {
    console.error("Error in registerOwner:", error.message);
    return res.status(500).json({
      message: "An error occurred while registering the owner.",
    });
  }
};

//  Student Registration  & send OTP on Email _________________________________________________
const registerStudent = async (req, res) => {
  try {
    const { errors, isValid } = validateRegisterStudent(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const existingEmail = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already in use.",
      });
    }

    const existingPhone = await StudentProfile.findOne({
      phone: req.body.phone.trim(),
    });
    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already in use." });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUND);

    const student = await User.create({
      firstName: req.body.firstName.toLowerCase().trim(),
      lastName: req.body.lastName ? req.body.lastName.toLowerCase().trim() : "",
      email: req.body.email.toLowerCase().trim(),
      password: hashedPassword,
      phone: req.body.phone.trim(),
      role: ROLES.STUDENT,
    });

    const studentProfile = await StudentProfile.create({
      userId: student._id,
      phone: student.phone,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    studentProfile.emailOtp.code = hashedOtp;
    studentProfile.emailOtp.expiresAt = expiresAt;

    await studentProfile.save();

    try {
      await sendEmail(
        student.email,
        "Verify your email - Libro Library",
        `<h2>Your OTP is: ${otp} </h2>
    <p>This OTP will expire in 10 minutes.</p>`,
      );
    } catch (emailError) {
      try {
        const user = await User.findByIdAndDelete(student._id);
        const studentProfile = await StudentProfile.findByIdAndDelete(
          studentProfile._id,
        );
      } catch (error) {
        console.log("Rollback failed: " + error.message);
      }
      console.log(
        "Email sending failed, rollback completed:",
        emailError.message,
      );
      return res.status(500).json({
        message:
          "Failed to send verification email. Please try registering again.",
      });
    }

    return res.status(201).json({
      message: "Registration successful. Please check your email for OTP.",
    });
  } catch (error) {
    console.log("Error in registerStudent:", error.message);
    return res.status(500).json({
      message: "An error occurred while registering the student.",
    });
  }
};

//  Verify Email  _________________________________________________
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

module.exports = { registerOwner, registerStudent, verifyEmail };
