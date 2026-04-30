const validator = require("validator");

const validateFirstName = (firstName) => {
  if (!firstName || firstName.trim() === "") {
    return "First name is required";
  } else if (firstName.trim().length < 2) {
    return "First name must be at least 2 characters";
  } else if (firstName.trim().length > 20) {
    return "First name cannot exceed 20 characters";
  }
};

const validateLastName = (lastName) => {
  if (lastName && lastName.trim().length > 20) {
    return "Last name cannot exceed 20 characters";
  }
};

const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return "Email is required";
  } else if (validator.isEmail(email.trim()) === false) {
    return "Please enter a valid email address";
  }
};

const validatePassword = (password) => {
  if (!password || password.trim() === "") {
    return "Password is required";
  } else if (password.length < 8) {
    return "Password must be at least 8 characters";
  } else if (
    validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }) === false
  ) {
    return "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol";
  }
};

const validatePhone = (phone) => {
  if (!phone || phone.trim() === "") {
    return "Phone number is required";
  } else if (validator.isMobilePhone(phone.trim(), "en-IN") === false) {
    return "Please enter a valid Indian mobile number";
  }
};

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

const validateRegisterStudent = (data) => {
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

module.exports = {
  validateRegisterOwner,
  validateRegisterStudent,
};
