const { validateUpdateFloor } = require("../../validators/floor.validator");
const Library = require("../../models/library.model");
const Floor = require("../../models/floor.model");

const updateFloor = async (req, res) => {
  try {
    const { floorId } = req.params;

    // 1 validate request body
    const { errors, isValid } = validateUpdateFloor(req.body);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid floor data", errors });
    }

    // 2 check library exist or not
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res
        .status(404)
        .json({ message: "Library not found for the user" });
    }

    // 3 check floor exist or not
    const existingFloor = await Floor.findOne({
      _id: floorId,
      libraryId: existingLibrary._id,
    });
    if (!existingFloor) {
      return res
        .status(404)
        .json({ message: "Floor not found for the library" });
    }

    // if floor update so check duplicate flor number is exist in same library or not

    if (req.body.number !== undefined) {
      const duplicateFloor = await Floor.findOne({
        libraryId: existingLibrary._id,
        number: Number(req.body.number),
      });
      if (duplicateFloor) {
        return res
          .status(400)
          .json({ message: "Floor number already exists in the library" });
      }
    }

    const updatedFloor = {};

    if (req.body.name !== undefined) updatedFloor.name = req.body.name.trim();
    if (req.body.number !== undefined)
      updatedFloor.number = Number(req.body.number);
    if (req.body.description !== undefined)
      updatedFloor.description = req.body.description.trim();

    const result = await Floor.findByIdAndUpdate(
      floorId,
      { $set: updatedFloor },
      { returnDocument: "after", runValidators: true },
    );

    return res.json({ message: "Floor updated successfully", floor: result });
  } catch (error) {
    console.error("Error updating floor:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong while updating floor" });
  }
};

module.exports = updateFloor;
