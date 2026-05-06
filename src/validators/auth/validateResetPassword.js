const { validateEmail, validateOtp, validatePassword } = require("../main");

// Validate confirm Password _________________________________
const validateConfirmPassword = (newPassword, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return "Confirm password required";
  } else if (!(newPassword === confirmPassword)) {
    return "Confirm password and new Password must be exactly same";
  }
};

const validateResetPassword = (data) => {
  const errors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const otpError = validateOtp(data.otp);
  if (otpError) errors.otp = otpError;

  const newPasswordError = validatePassword(data.newPassword);
  if (newPasswordError) errors.newPassword = newPasswordError;

  // 3 validate confirm password
  const confirmPasswordError = validateConfirmPassword(
    data.newPassword,
    data.confirmPassword,
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = validateResetPassword;
