const {
  validateRegisterOwner,
  validateRegisterStudent,
  validateVerifyEmail,
  validateResendOtp,
  validateLogin,
} = require("../validators/auth.validator");
const User = require("../models/user.model");
const { ROLES, APPROVAL_STATUS } = require("../constants/index.js");
const bcrypt = require("bcrypt");
const StudentProfile = require("../models/studentProfile.model");
const { sendEmail } = require("../utils/sendEmail.js");
const jwt = require("jsonwebtoken");

const SALT_ROUND = 10;

// Owner Register __________________________________________________________
const registerOwner = async (req, res) => {
  try {
    // Step 1 → Validate incoming data
    const { errors, isValid } = validateRegisterOwner(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // Step 2 → Check if owner already exists
    const existingOwner = await User.findOne({ role: ROLES.OWNER });
    if (existingOwner) {
      return res.status(403).json({
        message:
          "An owner account already exists. Multiple owners are not allowed.",
      });
    }

    // Step 3 → Check if email already taken
    const existingEmail = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already in use.",
      });
    }

    // Step 4 → Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUND);

    const owner = await User.create({
      firstName: req.body.firstName.toLowerCase().trim(),
      lastName: req.body.lastName ? req.body.lastName.toLowerCase().trim() : "",
      email: req.body.email.toLowerCase().trim(),
      password: hashedPassword,
      role: ROLES.OWNER, // hardcoded — never from user input
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

// Student Register _________________________________________________________
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

// Verify Email ______________________________________________________________
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

// Resend Otp ________________________________________________________________
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

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.log("Failed to send otp " + error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};

// login _____________________________________________________________________
const login = async (req, res) => {
  try {
    // 1 validate req body {email, password}
    const { errors, isValid } = validateLogin(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // 2 verify user (find user by email)
    const user = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid credential" });
    }

    // 3 check password (compare password with bcrypt)
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credential" });
    }

    // 4 isActive (does user is active)
    if (!user.isActive) {
      return res.status(403).json({ message: "You're not allowed here" });
    }

    // 5 isEmailVerified for student
    // 5.1 check role
    const isStudent = user.role === ROLES.STUDENT;
    if (isStudent) {
      const studentProfile = await StudentProfile.findOne({ userId: user._id });
      // 5.1.0 Check studentProfile exist
      if (!studentProfile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      // 5.1.1 Check is email verified
      if (!studentProfile.isEmailVerified) {
        return res
          .status(403)
          .json({ message: "Please verify your email first" });
      }
      // 5.1.2 Check approval status
      if (studentProfile.approvalStatus === APPROVAL_STATUS.PENDING) {
        return res.status(403).json({
          message: "You're not allow to login, Your status is pending",
        });
      }
      if (studentProfile.approvalStatus === APPROVAL_STATUS.REJECTED) {
        return res.status(403).json({
          message: "You're not allow to login, Your status is Rejected",
        });
      }
    }

    // 6 Generate Access Token
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    // 7 Generate Refresh Token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // 8 ------------ Lazy cleanup (Remove all expired token from DB) --------------
    const validTokens = user.refreshTokens.filter((token) => {
      try {
        jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        return true;
      } catch (error) {
        return false;
      }
    });

    // 8.1 save refresh token inside `refreshTokens field UserSchema`
    user.refreshTokens = validTokens;
    user.refreshTokens.push(refreshToken);
    await user.save();

    //9 set cookie in response to browser cookie storage
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 10 send success response
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
    return res
      .status(200)
      .json({ message: "Login successful", accessToken, userData });
  } catch (error) {
    console.error("Failed to login:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// refreshToken ______________________________________________________________
const refreshToken = async (req, res) => {
  try {
    //1  Read the refresh token from cookie
    const { refreshToken: incomingRefreshToken } = req.cookies;
    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "Token is required" });
    }

    // 2 Verify token with jwt
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

    // 3 find user in DB by userId
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    // 4 Check if exact token exists in user's refreshTokens array
    const tokenExist = user.refreshTokens.includes(incomingRefreshToken);
    if (!tokenExist) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 5 check user is active
    const isUserActive = user.isActive;

    if (!isUserActive) {
      return res.status(403).json({ message: "You are suspended" });
    }

    // 6 Generate new access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    // 7 Send success response
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      message: "New access token generated successfully",
      accessToken,
      userData,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please login again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    // Everything else = server error
    console.error("refreshToken error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// logout ____________________________________________________________________
const logout = async (req, res) => {
  try {
    // 1 read the refresh token cookie
    const { refreshToken: incomingRefreshToken } = req.cookies;
    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "No token found" });
    }
    // 2 Verify the token and get user data
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

    // 3 find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 4 remove only this token from DB
    const validTokens = user.refreshTokens.filter(
      (token) => token !== incomingRefreshToken,
    );

    // 5 save to DB after delete this token
    user.refreshTokens = validTokens;
    await user.save();

    // 6 clear the cookie from browser
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // 7 Send success message Logged out successfully
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.error("Cannot logout:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Failed to logout" });
  }
};

// logout from all Device ____________________________________________________
const logoutAll = async (req, res) => {
  try {
    // 1 read the refresh token cookie
    const { refreshToken: incomingRefreshToken } = req.cookies;
    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "No token found" });
    }
    // 2 Verify the token and get user data
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

    // 3 find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 4 remove all token from DB and save
    user.refreshTokens = [];
    await user.save();

    // 5 clear the cookie from browser
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // 6 Send success message Logged out successfully
    return res
      .status(200)
      .json({ message: "Logged out successfully from all device" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.error("Cannot logout:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Failed to logout" });
  }
};

module.exports = {
  registerOwner,
  registerStudent,
  verifyEmail,
  resendOtp,
  login,
  refreshToken,
  logout,
  logoutAll,
};
