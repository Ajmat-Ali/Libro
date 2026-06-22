const Library = require("../../models/library.model");
const Plan = require("../../models/plan.model");

const getOnePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not found." });
    }

    const existingPlan = await Plan.findOne({
      _id: planId,
      libraryId: existingLibrary._id,
    }).populate("timeSlotId");
    if (!existingPlan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    return res.status(200).json({ plan: existingPlan });
  } catch (error) {
    console.error("getOnePlan error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getOnePlan;
