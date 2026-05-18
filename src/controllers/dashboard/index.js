const getOwnerDashboard = require("./getOwnerDashboard.controller");
const getMembersReport = require("./getMembersReport.controller");
const getOccupancyReport = require("./getOccupancyReport.controller");
const getRevenueReport = require("./getRevenueReport.controller");
const getAttendanceReport = require("./getAttendanceReport.controller");
const studentDashboard = require("./studentDashboard.controller");

module.exports = {
  getOwnerDashboard,
  getMembersReport,
  getOccupancyReport,
  getRevenueReport,
  getAttendanceReport,
  studentDashboard,
};
