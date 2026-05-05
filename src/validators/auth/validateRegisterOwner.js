const {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
} = require("../main");

const validateRegisterOwner = (data) => {
  const errors = {};

  const firstNameError = validateFirstName(data.firstName);
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateLastName(data.lastName);
  if (lastNameError) errors.lastName = lastNameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = validateRegisterOwner;
