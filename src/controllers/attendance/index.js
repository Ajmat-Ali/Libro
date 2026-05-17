const getDailyReport = require("./getDailyReport.controller");
const getAbsentees = require("./getAbsentees.controller");
const getStudentAttendance = require("./getStudentAttendance.controller");
const markManualAttendance = require("./markManualAttendance.controller");
const deleteAttendance = require("./deleteAttendance.controller");
const getMyAttendance = require("./getMyAttendance.controller");

module.exports = {
  getDailyReport,
  getAbsentees,
  getStudentAttendance,
  markManualAttendance,
  deleteAttendance,
  getMyAttendance,
};
