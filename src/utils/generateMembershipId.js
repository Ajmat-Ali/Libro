const crypto = require("crypto");
const generateMembershipId = () => {
  return `LIB-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

module.exports = generateMembershipId;
