const createOwnerBooking = require("./createOwnerBooking.controller");
const getAllBookings = require("./getAllBookings.controller");
const getOneBooking = require("./getOneBooking.controller");
const extendBooking = require("./extendBooking.controller");
const cancelBooking = require("./cancelBooking.controller");

module.exports = {
  createOwnerBooking,
  getAllBookings,
  getOneBooking,
  extendBooking,
  cancelBooking,
};
