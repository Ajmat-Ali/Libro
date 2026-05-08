const Library = require("../../models/library.model");
const uploadToCloudinary = require("../../utils/uploadToCloudinary");
const cloudinary = require("../../config/cloudinary");

const uploadLogo = async (req, res) => {
  try {
    // Step 1 → Check if file exists
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded. Please provide an image file.",
      });
    }

    const user = req.user;

    // Step 2 → Find library
    const library = await Library.findOne({ ownerId: user._id });
    if (!library) {
      return res.status(404).json({
        message: "Library not found. Please create your library first.",
      });
    }

    // Step 3 → Delete old logo from Cloudinary if it exists
    if (library.logo) {
      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/[public_id]
        const urlParts = library.logo.split("/");
        const publicId = urlParts[urlParts.length - 1].split(".")[0];
        const folder = urlParts[urlParts.length - 2];

        await cloudinary.uploader.destroy(`${folder}/${publicId}`);
      } catch (deleteError) {
        console.warn("Could not delete old logo from Cloudinary:", deleteError);
        // Continue anyway - old logo will just remain in Cloudinary
      }
    }

    // Step 4 → Upload new logo to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "library-logos");

    // Step 5 → Update library with new logo URL
    const updatedLibrary = await Library.findByIdAndUpdate(
      library._id,
      { logo: result.secure_url },
      { returnDocument: "after" },
    );

    // Step 6 → Return success response
    return res.status(200).json({
      message: "Logo uploaded successfully",
      logo: updatedLibrary.logo,
    });
  } catch (error) {
    console.error("Error uploading logo:", error.message);
    return res.status(500).json({
      message: "An error occurred while uploading the logo.",
    });
  }
};

module.exports = uploadLogo;
