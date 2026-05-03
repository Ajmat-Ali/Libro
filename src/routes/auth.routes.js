const express = require("express");

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
} = require("../controllers/auth.controller");

router.post("/register-owner", registerOwner);
router.post("/register-student", registerStudent);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);

module.exports = router;
