const { validateCreateLibrary } = require("../../validators/library.validator");
const Library = require("../../models/library.model");

// ----> Helper function: Convert HH:MM to minutes from midnight <------
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

const createLibrary = async (req, res) => {
  try {
    // Step 1 → Validate request body
    const { errors, isValid } = validateCreateLibrary(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // Step 2 → Check if library already exists for this owner
    const user = req.user;

    const existingLibrary = await Library.findOne({ ownerId: user._id });
    if (existingLibrary) {
      return res.status(409).json({
        message:
          "You have already created a library. Only one library per owner allowed.",
      });
    }

    // Step 3 → Convert opening and closing times to minutes
    const openingTimeMinutes = timeToMinutes(req.body.timings.openingTime);
    let closingTimeMinutes = timeToMinutes(req.body.timings.closingTime);

    // If closing time is less than opening time, library closes next day
    // Example: Opens at 06:00 (360), closes at 05:00 next day
    // Then closingTime = 300 + 1440 = 1740 minutes
    if (closingTimeMinutes <= openingTimeMinutes) {
      closingTimeMinutes += 1440; // Add 24 hours
    }

    // Step 4 → Create library document
    const libraryData = {
      ownerId: user._id,
      name: req.body.name.trim(),
      description: req.body.description ? req.body.description.trim() : null,
      address: {
        street: req.body.address.street.trim(),
        city: req.body.address.city.trim(),
        state: req.body.address.state.trim(),
        pincode: req.body.address.pincode.trim(),
      },
      contact: {
        phone: req.body.contact.phone.trim(),
        email: req.body.contact.email.toLowerCase().trim(),
        website: req.body.contact.website
          ? req.body.contact.website.trim()
          : null,
      },
      timings: {
        openingTime: req.body.timings.openingTime.trim(),
        closingTime: req.body.timings.closingTime.trim(),
        openingTimeMinutes,
        closingTimeMinutes,
      },
      workingDays: req.body.workingDays || [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ], // Default if not provided
      hourlyRates: req.body.hourlyRates || {
        general: 0,
        vip: 0,
        window: 0,
        cabin: 0,
      }, // Default rates
    };

    const library = await Library.create(libraryData);

    // Step 5 → Return success response
    return res.status(201).json({
      message: "Library created successfully",
      library: {
        id: library._id,
        name: library.name,
        address: library.address,
        contact: library.contact,
        timings: library.timings,
        workingDays: library.workingDays,
        hourlyRates: library.hourlyRates,
      },
    });
  } catch (error) {
    console.error("Error creating library:", error.message);
    return res.status(500).json({
      message: "An error occurred while creating the library.",
    });
  }
};

module.exports = createLibrary;
