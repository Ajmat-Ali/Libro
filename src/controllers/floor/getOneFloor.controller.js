const Floor = require("../../models/floor.model");
const Library = require("../../models/library.model");

const getOneFloor = async (req, res) => {
  try {
    // 1 check library existence
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not found" });
    }

    // 2 get one floor by params id
    const floor = await Floor.findOne({
      _id: req.params.floorId,
      libraryId: existingLibrary._id,
    });
    if (!floor) {
      return res.status(404).json({ message: "Floor not found" });
    }

    // 3 send success message
    return res
      .status(200)
      .json({ message: "floor fetched successfully", floor });
  } catch (error) {
    console.error("Error to get one floor:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong to get one floor" });
  }
};

module.exports = getOneFloor;
