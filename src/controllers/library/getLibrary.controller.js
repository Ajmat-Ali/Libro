const Library = require("../../models/library.model");

const getLibrary = async (req, res) => {
  try {
    const user = req.user;

    // Find library by owner ID
    const library = await Library.findOne({ ownerId: user._id });

    if (!library) {
      return res.status(404).json({
        message:
          "Library setup not completed yet. Please create your library first.",
      });
    }

    // Return library details
    return res.status(200).json({
      library: {
        id: library._id,
        name: library.name,
        description: library.description,
        logo: library.logo,
        address: library.address,
        contact: library.contact,
        timings: library.timings,
        workingDays: library.workingDays,
        holidays: library.holidays,
        hourlyRates: library.hourlyRates,
        isActive: library.isActive,
        createdAt: library.createdAt,
        updatedAt: library.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching library:", error.message);
    return res.status(500).json({
      message: "An error occurred while fetching library details.",
    });
  }
};

module.exports = getLibrary;
