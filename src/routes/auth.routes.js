const express = require("express");

const router = express.Router();
const {
  registerOwner,
  registerStudent,
  verifyEmail,
} = require("../controllers/auth.controller");

router.post("/register-owner", registerOwner);
router.post("/register-student", registerStudent);
router.post("/verify-email", verifyEmail);

module.exports = router;
