const StudentProfile = require("../../models/studentProfile.model");
const User = require("../../models/user.model");
const generateRandomPassword = require("../../utils/generateRandomPassword");
const bcrypt = require("bcrypt");
const { SALT_ROUND, ROLES } = require("../../constants/index");
const generateMembershipId = require("../../utils/generateMembershipId");
const {
  validateAddWalkInMember,
} = require("../../validators/member.validator");
const { sendEmail } = require("../../utils/sendEmail");

const addWalkInMember = async (req, res) => {
  try {
    const { errors, isValid } = validateAddWalkInMember(req.body);
    if (!isValid) return res.status(400).json({ errors });

    // Check duplicates
    const existingEmail = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const existingPhone = await StudentProfile.findOne({
      phone: req.body.phone.trim(),
    });
    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already in use." });
    }

    const rawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, SALT_ROUND);

    const student = await User.create({
      firstName: req.body.firstName.trim().toLowerCase(),
      lastName: req.body.lastName ? req.body.lastName.trim().toLowerCase() : "",
      email: req.body.email.toLowerCase().trim(),
      password: hashedPassword,
      phone: req.body.phone.trim(),
      role: ROLES.STUDENT,
      isActive: true,
    });

    const membershipId = generateMembershipId();

    const profile = await StudentProfile.create({
      userId: student._id,
      phone: student.phone,
      address: req.body.address ? req.body.address.trim() : null,
      approvalStatus: "approved",
      isEmailVerified: true,
      membershipId,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    });

    try {
      await sendEmail(
        student.email,
        "Your Libro Library account is ready!",
        `
          <h2>Welcome to Libro Library!</h2>
          <p>Your account has been created by the library owner.</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>Temporary Password:</strong> ${rawPassword}</p>
          <p><strong>Membership ID:</strong> ${membershipId}</p>
          <p>Please login and change your password immediately.</p>
        `,
      );
    } catch (error) {
      console.error("Walk-in email failed:", emailErr.message);
    }
    return res.status(201).json({
      message: "Walk-in member added successfully.",
      member: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: profile.phone,
        membershipId: profile.membershipId,
      },

      temporaryPassword: rawPassword,
    });
  } catch (error) {
    console.error("addWalkInMember error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = addWalkInMember;
