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

module.exports = validateFirstName;
