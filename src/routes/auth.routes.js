const express = require("express");
const { authLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();
const {
  registerOwner,
  registerStudent,
  verifyEmail,
  resendOtp,
  login,
  refreshToken,
  logout,
  logoutAll,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth/index");
const auth = require("../middlewares/auth.middleware");

router.post("/register-owner", authLimiter, registerOwner);
router.post("/register-student", authLimiter, registerStudent);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-otp", authLimiter, resendOtp);
router.post("/login", authLimiter, login);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);
router.post("/change-password", authLimiter, auth, changePassword);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

module.exports = router;
