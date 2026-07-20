const Floor = require("../../models/floor.model");
const Library = require("../../models/library.model");

const getAllFloor = async (req, res) => {
  try {
    const existingLibrary = await Library.findOne({});

    if (!existingLibrary) {
      return res.status(404).json({ message: "Library not found" });
    }

    const allFloors = await Floor.find({
      libraryId: existingLibrary._id,
    }).sort({ number: 1 });

    return res.status(200).json({
      message: "All Floors fetched successfully",
      count: allFloors.length,
      floors: allFloors,
    });
  } catch (error) {
    console.error("Error to get all floors:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong to gel all floors" });
  }
};

module.exports = getAllFloor;
