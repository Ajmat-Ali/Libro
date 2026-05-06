const validateRegisterOwner = require("./validateRegisterOwner");
const validateRegisterStudent = require("./validateRegisterStudent");
const validateVerifyEmail = require("./validateVerifyEmail");
const validateResendOtp = require("./validateResendOtp");
const validateLogin = require("./validateLogin");
const validateChangePassword = require("./validateChangePassword");
const validateForgotPassword = require("./validateForgotPassword");
const validateResetPassword = require("./validateResetPassword");
const validateRegisterGuard = require("./validateRegisterGuard");

module.exports = {
  validateRegisterOwner,
  validateRegisterStudent,
  validateVerifyEmail,
  validateResendOtp,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateRegisterGuard,
};
