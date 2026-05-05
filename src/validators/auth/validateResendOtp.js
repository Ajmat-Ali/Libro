const { validateEmail } = require("../main");

const validateResendOtp = (data) => {
  const errors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = validateResendOtp;
