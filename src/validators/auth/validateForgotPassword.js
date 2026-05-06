const { validateEmail } = require("../main");

const validateForgotPassword = (data) => {
  const errors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = validateForgotPassword;
