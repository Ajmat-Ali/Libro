const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  try {
    // 1 Get authorization

    const authorizationToken = req.headers.authorization;
    if (!authorizationToken || !authorizationToken.startsWith("Bearer")) {
      return res.status(401).json({ message: "Token is required" });
    }

    // 2 extract accessToken from authorization
    const accessToken = authorizationToken.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ message: "Access token required" });
    }

    // 3 verify access token and handle error in catch
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

    // 4 get user data from DB
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 5 Check is user active
    if (!user.isActive) {
      return res.status(403).json({ message: "You're suspended" });
    }

    // 6 attch to user to req object
    req.user = user;
    // 7 Call request handler

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("You're not authorized person:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = auth;
