const { validateFloor } = require("../../validators/floor.validator");
const Library = require("../../models/library.model");
const Floor = require("../../models/floor.model");

const createFloor = async (req, res) => {
  try {
    // 1 validate floor data from req.body
    const { errors, isValid } = validateFloor(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    //2 check whether library exist or not
    const existingLibrary = await Library.findOne({ ownerId: req.user._id });
    if (!existingLibrary) {
      return res
        .status(404)
        .json({ message: "Library not found. please create Library first" });
    }

    // 3 Check if floor number already exists in this library
    const existingFloor = await Floor.findOne({
      libraryId: existingLibrary._id,
      number: Number(req.body.number),
    });
    if (existingFloor) {
      return res.status(409).json({
        message: `Floor number ${req.body.number} already exists in this library`,
      });
    }

    // 4 Create new Floor
    const newFloor = await Floor.create({
      libraryId: existingLibrary._id,
      name: req.body.name,
      number: Number(req.body.number),
      description: req.body.description,
    });

    return res
      .status(201)
      .json({ message: "floor created successfully", floor: newFloor });
  } catch (error) {
    console.error("Error occured to create floor:", error.message);
    return res
      .status(500)
      .json({ message: "An error occured while creating floor" });
  }
};

module.exports = createFloor;
