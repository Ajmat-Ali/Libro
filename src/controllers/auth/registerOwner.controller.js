const { SALT_ROUND, ROLES } = require("../../constants/index");
const { validateRegisterOwner } = require("../../validators/auth/index");
const User = require("../../models/user.model");
const bcrypt = require("bcrypt");

const registerOwner = async (req, res) => {
  try {
    // Step 1 -> Validate incoming data
    const { errors, isValid } = validateRegisterOwner(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // Step 2 -> Check if owner already exists
    const existingOwner = await User.findOne({ role: ROLES.OWNER });
    if (existingOwner) {
      return res.status(403).json({
        message:
          "An owner account already exists. Multiple owners are not allowed.",
      });
    }

    // Step 3 -> Check if email already taken
    const existingEmail = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already in use.",
      });
    }

    // Step 4 -> Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUND);

    const owner = await User.create({
      firstName: req.body.firstName.toLowerCase().trim(),
      lastName: req.body.lastName ? req.body.lastName.toLowerCase().trim() : "",
      email: req.body.email.toLowerCase().trim(),
      password: hashedPassword,
      role: ROLES.OWNER,
    });

    return res.status(201).json({
      message: "Owner registered successfully",
      user: {
        id: owner._id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
        role: owner.role,
      },
    });
  } catch (error) {
    console.error("Error in registerOwner:", error.message);
    return res.status(500).json({
      message: "An error occurred while registering the owner.",
    });
  }
};

module.exports = { registerOwner };
