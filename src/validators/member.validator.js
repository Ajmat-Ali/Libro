const validator = require("validator");

const validateAddWalkInMember = (data) => {
  const errors = {};

  if (!data.firstName || data.firstName.trim() === "") {
    errors.firstName = "First name is required";
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  } else if (data.firstName.trim().length > 20) {
    errors.firstName = "First name cannot exceed 20 characters";
  }

  if (data.lastName && data.lastName.trim().length > 20) {
    errors.lastName = "Last name cannot exceed 20 characters";
  }

  if (!data.email || data.email.trim() === "") {
    errors.email = "Email is required";
  } else if (!validator.isEmail(data.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.phone || data.phone.trim() === "") {
    errors.phone = "Phone number is required";
  } else if (!validator.isMobilePhone(data.phone.trim(), "en-IN")) {
    errors.phone = "Please enter a valid Indian mobile number";
  }

  if (data.address && data.address.trim().length > 200) {
    errors.address = "Address cannot exceed 200 characters";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

const validateUpdateMember = (data) => {
  const errors = {};

  if (data.firstName !== undefined) {
    if (data.firstName.trim() === "") {
      errors.firstName = "First name cannot be empty";
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    } else if (data.firstName.trim().length > 20) {
      errors.firstName = "First name cannot exceed 20 characters";
    }
  }

  if (data.lastName !== undefined && data.lastName !== null) {
    if (data.lastName.trim().length > 20) {
      errors.lastName = "Last name cannot exceed 20 characters";
    }
  }

  if (data.phone !== undefined) {
    if (data.phone.trim() === "") {
      errors.phone = "Phone number cannot be empty";
    } else if (!validator.isMobilePhone(data.phone.trim(), "en-IN")) {
      errors.phone = "Please enter a valid Indian mobile number";
    }
  }

  if (data.address !== undefined && data.address !== null) {
    if (data.address.trim().length > 200) {
      errors.address = "Address cannot exceed 200 characters";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

module.exports = { validateAddWalkInMember, validateUpdateMember };
