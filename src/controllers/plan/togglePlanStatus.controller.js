const Library = require("../../models/library.model");
const Plan = require("../../models/plan.model");

const togglePlanStatus = async (req, res) => {
  try {
    const { planId } = req.params;
    // ------------------- Get Library ------------------------------------
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------------ Get One Plan by planId -------------------
    const existingPlan = await Plan.findOne({
      _id: planId,
      libraryId: existingLibrary._id,
    });
    if (!existingPlan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    // ------------------------ Update Plan status -------------------
    existingPlan.isActive = !existingPlan.isActive;
    existingPlan.statusUpdatedBy = req.user.id;
    existingPlan.statusUpdatedAt = new Date();
    await existingPlan.save();

    // ------------------------ Success message -------------------
    return res.status(200).json({
      message: `Plan ${existingPlan.isActive ? "activated" : "deactivated"} successfully.`,
      isActive: existingPlan.isActive,
    });
  } catch (error) {
    console.error("togglePlanStatus error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = togglePlanStatus;
