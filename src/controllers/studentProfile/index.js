const getMyProfile = require("./getMyProfile");
const updateMyProfile = require("./updateMyProfile.controller");
const getMyPayments = require("./getMyPayments.controller");
const downloadMyReceipt = require("./downloadMyReceipt.controller");

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyPayments,
  downloadMyReceipt,
};
