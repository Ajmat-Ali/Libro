const Library = require("../../models/library.model");
const Plan = require("../../models/plan.model");

const getAllPlans = async (req, res) => {
  try {
    // ------------------- Get Library ----------------------------
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------------- Get plans ------------------------
    const plans = await Plan.find({ libraryId: existingLibrary._id })
      .populate("timeSlotId")
      .sort({ seatType: 1, calculatedPrice: 1 });

    //   ------------------- Return success message -----------------
    return res.status(200).json({
      message: "Plans fetched successfully.",
      count: plans.length,
      plans,
    });
  } catch (error) {
    console.error("getAllPlans error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getAllPlans;
