const { validateUpdateLibrary } = require("../../validators/library.validator");
const Library = require("../../models/library.model");
const syncPlans = require("../../utils/syncPlans");

// Helper function: Convert HH:MM to minutes from midnight
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

const updateLibrary = async (req, res) => {
  try {
    const { errors, isValid } = validateUpdateLibrary(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const user = req.user;

    const library = await Library.findOne({ ownerId: user._id });
    if (!library) {
      return res.status(404).json({
        message: "Library not found. Please create your library first.",
      });
    }

    const updateData = {};

    if (req.body.name !== undefined) updateData.name = req.body.name.trim();
    if (req.body.description !== undefined)
      updateData.description = req.body.description
        ? req.body.description.trim()
        : null;
    if (req.body.isActive !== undefined)
      updateData.isActive = req.body.isActive;

    if (req.body.address) {
      updateData.address = {
        ...library.address.toObject(),
        street: req.body.address.street
          ? req.body.address.street.trim()
          : library.address.street,
        city: req.body.address.city
          ? req.body.address.city.trim()
          : library.address.city,
        state: req.body.address.state
          ? req.body.address.state.trim()
          : library.address.state,
        pincode: req.body.address.pincode
          ? req.body.address.pincode.trim()
          : library.address.pincode,
      };
    }

    // Contact object - merge with existing
    if (req.body.contact) {
      updateData.contact = {
        ...library.contact.toObject(),
        phone: req.body.contact.phone
          ? req.body.contact.phone.trim()
          : library.contact.phone,
        email: req.body.contact.email
          ? req.body.contact.email.toLowerCase().trim()
          : library.contact.email,
        website: req.body.contact.website
          ? req.body.contact.website.trim()
          : library.contact.website,
      };
    }

    // Timings object - recalculate minutes if updated
    if (req.body.timings) {
      const openingTime =
        req.body.timings.openingTime || library.timings.openingTime;
      let closingTime =
        req.body.timings.closingTime || library.timings.closingTime;

      const openingTimeMinutes = timeToMinutes(openingTime);
      let closingTimeMinutes = timeToMinutes(closingTime);

      // Handle midnight crossing
      if (closingTimeMinutes <= openingTimeMinutes) {
        closingTimeMinutes += 1440;
      }

      updateData.timings = {
        openingTime,
        closingTime,
        openingTimeMinutes,
        closingTimeMinutes,
      };
    }

    // Working days array
    if (req.body.workingDays !== undefined) {
      updateData.workingDays = req.body.workingDays;
    }

    // Hourly rates - merge with existing
    if (req.body.hourlyRates) {
      updateData.hourlyRates = {
        ...library.hourlyRates.toObject(),
        ...req.body.hourlyRates,
      };
    }

    // Step 4 → Update library
    const updatedLibrary = await Library.findByIdAndUpdate(
      library._id,
      updateData,
      { returnDocument: "after", runValidators: true },
    );

    if (req.body.hourlyRates) {
      syncPlans(library._id);
    }

    // Step 5 → Return success response
    return res.status(200).json({
      message: "Library updated successfully",
      library: {
        id: updatedLibrary._id,
        name: updatedLibrary.name,
        description: updatedLibrary.description,
        logo: updatedLibrary.logo,
        address: updatedLibrary.address,
        contact: updatedLibrary.contact,
        timings: updatedLibrary.timings,
        workingDays: updatedLibrary.workingDays,
        holidays: updatedLibrary.holidays,
        hourlyRates: updatedLibrary.hourlyRates,
        isActive: updatedLibrary.isActive,
        updatedAt: updatedLibrary.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating library:", error.message);
    return res.status(500).json({
      message: "An error occurred while updating the library.",
    });
  }
};

module.exports = updateLibrary;
