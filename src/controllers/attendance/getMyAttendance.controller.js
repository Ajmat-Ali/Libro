const getMyAttendance = async (req, res) => {
  try {
  } catch (error) {
    console.error("getMyAttendance error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = getMyAttendance;
