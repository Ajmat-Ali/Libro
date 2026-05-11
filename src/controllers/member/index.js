const getAllMembers = require("./getAllMembers.controller");
const getOneMember = require("./getOneMember.controller");
const reviewMember = require("./reviewMember.controller");
const toggleMemberStatus = require("./toggleMemberStatus.controller");
const addWalkInMember = require("./addWalkInMember.controller");
const updateMember = require("./updateMember.controller");

module.exports = {
  getAllMembers,
  getOneMember,
  reviewMember,
  toggleMemberStatus,
  addWalkInMember,
  updateMember,
};
