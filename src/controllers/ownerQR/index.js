const getStudentQRList = require("./getStudentQRList.controller");
const viewStudentQRImage = require("./viewStudentQRImage.controller");
const downloadStudentQRImage = require("./downloadStudentQRImage.controller");
const getTodaySummary = require("./getTodaySummary.controller");
const getStudentEntryHistory = require("./getStudentEntryHistory.controller");
const getAllEntryLogs = require("./getAllEntryLogs.controller");

module.exports = {
  getStudentQRList,
  viewStudentQRImage,
  downloadStudentQRImage,
  getTodaySummary,
  getStudentEntryHistory,
  getAllEntryLogs,
};
