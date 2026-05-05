const validator = require("validator");
const validatePhone = (phone) => {
  if (!phone || phone.trim() === "") {
    return "Phone number is required";
  } else if (validator.isMobilePhone(phone.trim(), "en-IN") === false) {
    return "Please enter a valid Indian mobile number";
  }
};

module.exports = validatePhone;
