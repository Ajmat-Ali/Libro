const express = require("express");

const router = express.Router();

const {
  getAllMembers,
  getOneMember,
  reviewMember,
  toggleMemberStatus,
  addWalkInMember,
  updateMember,
} = require("../controllers/member/index");
const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

router.post("/", auth, restrictTo("owner"), addWalkInMember);
router.get("/", auth, restrictTo("owner"), getAllMembers);
router.get("/:memberId", auth, restrictTo("owner"), getOneMember);
router.patch("/:memberId/review", auth, restrictTo("owner"), reviewMember);
router.patch(
  "/:memberId/toggle-status",
  auth,
  restrictTo("owner"),
  toggleMemberStatus,
);
router.patch("/:memberId", auth, restrictTo("owner"), updateMember);

module.exports = router;
