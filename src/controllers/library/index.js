const createLibrary = require("./createLibrary.controller");
const getLibrary = require("./getLibrary.controller");
const updateLibrary = require("./updateLibrary.controller");
const uploadLogo = require("./uploadLogo.controller");
const addHoliday = require("./addHoliday.controller");
const removeHoliday = require("./removeHoliday.controller");

module.exports = {
  createLibrary,
  getLibrary,
  updateLibrary,
  uploadLogo,
  addHoliday,
  removeHoliday,
};
