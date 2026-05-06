const {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
  validatePhone,
} = require("../main");

const validateRegisterGuard = (data) => {
  const errors = {};

  const firstNameError = validateFirstName(data.firstName);
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateLastName(data.lastName);
  if (lastNameError) errors.lastName = lastNameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = validateRegisterGuard;
