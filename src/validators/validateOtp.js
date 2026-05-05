const validator = require("validator");
const validateOtp = (otp) => {
  if (!otp || otp.trim() === "") {
    return "Otp is required";
  } else if (!/^\d{6}$/.test(otp)) {
    return "OTP must be exactly 6 digits";
  }
};

module.exports = validateOtp;
