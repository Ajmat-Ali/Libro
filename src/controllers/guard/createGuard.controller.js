const { SALT_ROUND, ROLES } = require("../../constants");
const User = require("../../models/user.model");
const { validateRegisterGuard } = require("../../validators/auth/index");

const bcrypt = require("bcrypt");

const createGuard = async (req, res) => {
  try {
    // 1 validate Guard Data
    const { errors, isValid } = validateRegisterGuard(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // 2 check if email already exist
    const existingEmail = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // 3 Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUND);

    // 4 create guard
    const guard = await User.create({
      firstName: req.body.firstName.toLowerCase().trim(),
      lastName: req.body.lastName
        ? req.body.lastName.toLowerCase().trim()
        : undefined,
      email: req.body.email.toLowerCase().trim(),
      password: hashedPassword,
      phone: req.body.phone.trim(),
      role: ROLES.GUARD,
    });

    // 5 return success message
    return res.status(201).json({
      message: "Guard registered successfully",
      user: {
        id: guard._id,
        firstName: guard.firstName,
        lastName: guard.lastName,
        email: guard.email,
        phone: guard.phone,
        role: guard.role,
      },
    });
  } catch (error) {
    console.error("Failed to create Guard:", error.message);
    return res.status(500).json({ message: "Something wen wrong" });
  }
};

module.exports = createGuard;
