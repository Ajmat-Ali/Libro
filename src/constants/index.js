const ROLES = {
  OWNER: "owner",
  GUARD: "guard",
  STUDENT: "student",
};

const APPROVAL_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

const SALT_ROUND = 10;

const VALID_STATUSES = ["active", "maintenance", "reserved", "disabled"];

module.exports = { ROLES, APPROVAL_STATUS, SALT_ROUND, VALID_STATUSES };
