const { registerOwner } = require("./registerOwner");
const { registerStudent } = require("./registerStudent");
const { verifyEmail } = require("./verifyEmail");
const { resendOtp } = require("./resendOtp");
const { login } = require("./login");
const { refreshToken } = require("./refreshToken");
const { logout } = require("./logout");
const { logoutAll } = require("./logoutAll");
const changePassword = require("./changePassword");

module.exports = {
  registerOwner,
  registerStudent,
  verifyEmail,
  resendOtp,
  login,
  refreshToken,
  logout,
  logoutAll,
  changePassword,
};
