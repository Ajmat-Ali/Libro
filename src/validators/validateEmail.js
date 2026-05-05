const validator = require("validator");

const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return "Email is required";
  } else if (validator.isEmail(email.trim()) === false) {
    return "Please enter a valid email address";
  }
};

module.exports = validateEmail;
