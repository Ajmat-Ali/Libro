const createSeat = require("./createSeat.controller");
const bultCreateSeat = require("./bulkCreateSeat.controller");
const getAllSeats = require("./getAllSeats.controller");
const getOneSeat = require("./getOneSeat.controller");
const updateSeat = require("./updateSeat.controller");
const updateSeatStatus = require("./updateSeatStatus.controller");
const deleteSeat = require("./deleteSeat.controller");
const seatGrid = require("./seatGrid.controller");

module.exports = {
  createSeat,
  bultCreateSeat,
  getAllSeats,
  getOneSeat,
  updateSeat,
  updateSeatStatus,
  deleteSeat,
  seatGrid,
};
