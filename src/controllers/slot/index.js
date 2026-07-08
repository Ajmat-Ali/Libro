const createSlot = require("./createSlot.controller");
const getAllSlot = require("./getAllSlots.controller");
const getOneSlot = require("./getOneSlot.controller");
const updateSlot = require("./updateSlot.controller");
const toggleSlotStatus = require("./toggleSlotStatus.controller");
const deleteSlot = require("./deleteSlot.controller");

module.exports = {
  createSlot,
  getAllSlot,
  getOneSlot,
  updateSlot,
  toggleSlotStatus,
  deleteSlot,
};
