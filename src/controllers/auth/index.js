const { registerOwner } = require("./registerOwner.controller");
const { registerStudent } = require("./registerStudent.controller");
const { verifyEmail } = require("./verifyEmail.controller");
const { resendOtp } = require("./resendOtp.controller");
const { login } = require("./login.controller");
const { refreshToken } = require("./refreshToken.controller");
const { logout } = require("./logout.controller");
const { logoutAll } = require("./logoutAll.controller");
const changePassword = require("./changePassword.controller");
const forgotPassword = require("./forgotPassword.controller");
const resetPassword = require("./resetPassword.controller");

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
  forgotPassword,
  resetPassword,
};
