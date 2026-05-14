const handleWebhook = require("./handleWebhook.controller");
const recordCashPayment = require("./recordCashPayment.controller");
const getAllPayments = require("./getAllPayments.controller");
const getOnePayment = require("./getOnePayment.controller");
const getRevenueSummary = require("./getRevenueSummary.controller");

module.exports = {
  recordCashPayment,
  getAllPayments,
  getOnePayment,
  getRevenueSummary,
};
