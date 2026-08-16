const { validateRegisterStudent } = require("../../validators/auth/index");
const User = require("../../models/user.model");
const StudentProfile = require("../../models/studentProfile.model");
const bcrypt = require("bcrypt");
const { ROLES, SALT_ROUND } = require("../../constants/index");
const { sendEmail } = require("../../utils/sendEmail");
const uploadToCloudinary = require("../../utils/uploadToCloudinary");
const generateMembershipId = require("../../utils/generateMembershipId");

const registerStudent = async (req, res) => {
  try {
    // 1. validate incoming data
    const { errors, isValid } = validateRegisterStudent(req.body);

    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // 2. check if email already taken
    const existingEmail = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already in use.",
      });
    }

    // 3. check phone is unique
    const existingPhone = await StudentProfile.findOne({
      phone: req.body.phone.trim(),
    });
    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already in use." });
    }

    // 4. hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUND);

    // 5.0 --------------- ProfilePic and ID Proof store ----------------
    const profilePicFile = req.files["profilePic"]?.[0];
    const idProofFile = req.files["idProof"]?.[0];

    let profilePicResult;
    let idProofResult;

    if (profilePicFile) {
      profilePicResult = await uploadToCloudinary(
        profilePicFile.buffer,
        "profile-pics",
      );
    }

    if (idProofFile) {
      idProofResult = await uploadToCloudinary(idProofFile.buffer, "id-proofs");
    }

    // 4. create student in DB
    const student = await User.create({
      firstName: req.body.firstName.toLowerCase().trim(),
      lastName: req.body.lastName ? req.body.lastName.toLowerCase().trim() : "",
      email: req.body.email.toLowerCase().trim(),
      password: hashedPassword,
      phone: req.body.phone.trim(),
      role: ROLES.STUDENT,
    });

    // 5. Create student Profile in DB
    const studentProfile = await StudentProfile.create({
      userId: student._id,
      phone: student.phone,
      address: req.body.address.trim() ? req.body.address.trim() : null,
      photo: profilePicResult && profilePicResult.secure_url,
      idProof: idProofResult && idProofResult.secure_url,
      membershipId: generateMembershipId(),
    });

    // 6. generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 7. Hash the OTP
    const hashedOtp = await bcrypt.hash(otp, SALT_ROUND);

    // 8. expireTime
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 9. update studentProfile
    studentProfile.emailOtp.code = hashedOtp;
    studentProfile.emailOtp.expiresAt = expiresAt;

    // 9. Save updated data
    await studentProfile.save();

    // 10. sendEmail // Rollback: Delete student and studentProfile if email fails
    try {
      await sendEmail(
        student.email,
        "Verify your email - Libro Library",
        `<h2>Your OTP is: ${otp} </h2>
      <p>This OTP will expire in 10 minutes.</p>`,
      );
    } catch (emailError) {
      try {
        await User.findByIdAndDelete(student._id);
        await StudentProfile.findByIdAndDelete(studentProfile._id);
      } catch (error) {
        console.log(`Rollback failed ${error.message}`);
      }
      console.log(
        "Email sending failed, rollback completed:",
        emailError.message,
        emailError,
      );
      return res.status(500).json({
        message:
          "Failed to send verification email. Please try registering again.",
        error: emailError.message,
      });
    }

    return res.status(201).json({
      message: "Registration successful. Please check your email for OTP.",

      ...(process.env.SHOW_OTP_IN_RESPONSE === "true" && { devOtp: otp }),
    });
  } catch (error) {
    console.log("Error in registerStudent:", error.message);
    return res.status(500).json({
      message:
        "An error occurred while registering the student. " + error.message,
    });
  }
};

module.exports = { registerStudent };
