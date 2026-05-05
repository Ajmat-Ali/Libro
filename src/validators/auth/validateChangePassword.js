const validatePassword = require("../validatePassword");

// Validate confirm Password _________________________________
const validateConfirmPassword = (newPassword, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return "Confirm password required";
  } else if (!(newPassword === confirmPassword)) {
    return "Confirm password and new Password must be exactly same";
  }
};

// Validate change password _______________________________________________________________________
const validateChangePassword = (data) => {
  const errors = {};

  // 1 validate current password
  const currentPasswordError = validatePassword(data.currentPassword, {
    checkStrength: false,
  });
  if (currentPasswordError)
    errors.currentPassword = "Current " + currentPasswordError;

  // 2 validate new Password
  const newPasswordError = validatePassword(data.newPassword);
  if (newPasswordError) errors.newPassword = "New " + newPasswordError;

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

module.exports = validateChangePassword;
