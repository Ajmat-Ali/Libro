// Supports: search (name/email/phone), approvalStatus filter,
//           isActive filter, pagination

const StudentProfile = require("../../models/studentProfile.model");

const getAllMembers = async (req, res) => {
  try {
    // ---------------1  Extract all filter variable ------------------
    const {
      search,
      approvalStatus,
      isActive,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // -------------- 2  Build profile filter -------------------------
    const profileFilter = {};

    if (approvalStatus) {
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(approvalStatus)) {
        return res.status(400).json({
          message: `approvalStatus must be one of: ${validStatuses.join(", ")}`,
        });
      }
      profileFilter.approvalStatus = approvalStatus;
    }

    // --------------3 Phone search directly on StudentProfile -------------------------
    if (search && /^\d+$/.test(search.trim())) {
      profileFilter.phone = { $regex: search.trim(), $options: "i" };
    }

    // --------------4 Get all profile with user data populated -------------------------
    let profiles = await StudentProfile.find(profileFilter)
      .populate("userId", "-password -refreshTokens -passwordResetOtp")
      .select("-emailOtp");

    // --------------5 Remove any orphan profiles (safety — shouldn't happen) -------------------------
    profiles = profiles.filter((p) => p.userId !== null);

    // --------------6 Apply name/email search (in-memory — fine for small library dataset)-------------------------
    if (search && !/^\d+$/.test(search.trim())) {
      const searchLower = search.trim().toLowerCase();

      profiles = profiles.filter((p) => {
        const u = p.userId;
        return (
          u.firstName.toLowerCase().includes(searchLower) ||
          (u.lastName && u.lastName.toLowerCase().includes(searchLower)) ||
          u.email.toLowerCase().includes(searchLower)
        );
      });
    }

    // ------------------------ 7 Apply isActive filter ---------------------------
    if (isActive) {
      const flag = isActive === "true";
      profiles = profiles.filter((p) => p.userId && p.userId.isActive === flag);
    }

    const total = profiles.length;
    const paginated = profiles.slice(skip, skip + limitNum);

    return res.status(200).json({
      message: "Members fetched successfully.",
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      members: paginated,
    });
  } catch (error) {
    console.error("getAllMembers error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getAllMembers;
