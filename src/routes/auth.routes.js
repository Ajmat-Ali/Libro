const express = require("express");

const router = express.Router();
const {
  registerOwner,
  registerStudent,
} = require("../controllers/auth.controller");

router.post("/register-owner", registerOwner);
router.post("/register-student", registerStudent);

module.exports = router;
