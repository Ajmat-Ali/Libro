const validator = require("validator");
const validateLastName = (lastName) => {
  if (lastName && lastName.trim().length > 20) {
    return "Last name cannot exceed 20 characters";
  }
};

module.exports = validateLastName;
