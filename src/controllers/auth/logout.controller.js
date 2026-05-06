const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");

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

module.exports = { logout };
