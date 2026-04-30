const {
  validateRegisterOwner,
  validateRegisterStudent,
} = require("../validators/auth.validator");
const User = require("../models/user.model");
const { ROLES } = require("../constants/index.js");
const bcrypt = require("bcrypt");
const StudentProfile = require("../models/studentProfile.model");
const { sendEmail } = require("../utils/sendEmail.js");

const SALT_ROUND = 10;

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

    await sendEmail(
      student.email,
      "Verify your email - Libro Library",
      `<h2>Your OTP is: ${otp} </h2>
    <p>This OTP will expire in 10 minutes.</p>`,
    );

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

module.exports = { registerOwner, registerStudent };
