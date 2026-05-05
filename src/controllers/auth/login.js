const { validateLogin } = require("../../validators/auth/index.js");
const User = require("../../models/user.model");
const { ROLES, APPROVAL_STATUS } = require("../../constants/index.js");
const bcrypt = require("bcrypt");
const StudentProfile = require("../../models/studentProfile.model");
const jwt = require("jsonwebtoken");

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

module.exports = { login };
