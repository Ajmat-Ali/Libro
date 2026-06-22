const Floor = require("../../models/floor.model");
const Library = require("../../models/library.model");

const toggleFloorStatus = async (req, res) => {
  try {
    const { floorId } = req.params;

    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not created yet" });
    }

    const existingFloor = await Floor.findOne({
      libraryId: existingLibrary._id,
      _id: floorId,
    });
    if (!existingFloor) {
      return res
        .status(404)
        .json({ message: "Floor not found for the library" });
    }

    existingFloor.isActive = !existingFloor.isActive;
    await existingFloor.save();

    return res.status(200).json({
      message: `Floor ${existingFloor.isActive ? "activated" : "deactivated"} successfully`,
      isActive: existingFloor.isActive,
    });
  } catch (error) {
    console.error("Error toggling floor status:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong while toggling floor status" });
  }
};

module.exports = toggleFloorStatus;
