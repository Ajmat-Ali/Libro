const { ROLES } = require("../../constants");
const User = require("../../models/user.model");

const getGuards = async (req, res) => {
  try {
    const allGuards = await User.find({ role: ROLES.GUARD }).select(
      "-password -passwordResetOtp -refreshTokens",
    );

    return res
      .status(200)
      .json({ message: "All guards fetched successfully", guards: allGuards });
  } catch (error) {
    console.error("Fauiled to get Guards:", error.message);
    return res.status(500).json({ message: "something went wrong" });
  }
};

module.exports = getGuards;
