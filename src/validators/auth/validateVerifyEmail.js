const { validateEmail, validateOtp } = require("../main");

const validateVerifyEmail = (data) => {
  const errors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const otpError = validateOtp(data.otp);
  if (otpError) errors.otp = otpError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = validateVerifyEmail;
