const validator = require("validator");
const validatePassword = (password, option = { checkStrength: true }) => {
  if (!password || password.trim() === "") {
    return "Password is required";
  }

  if (option.checkStrength) {
    if (password.length < 8) {
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
  }
};

module.exports = validatePassword;
