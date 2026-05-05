const { validateEmail, validatePassword } = require("../main");

const validateLogin = (data) => {
  const errors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password, {
    checkStrength: false,
  });
  if (passwordError) errors.password = passwordError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = validateLogin;
