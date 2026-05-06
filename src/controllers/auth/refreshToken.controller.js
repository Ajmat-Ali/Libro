const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");

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

module.exports = { refreshToken };
