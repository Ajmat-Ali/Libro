const Library = require("../../models/library.model");
const QRCode = require("../../models/qrCode.model");
const generateQRBuffer = require("../../utils/generateQR");

const viewStudentQRImage = async (req, res) => {
  try {
    const { qrId, memberId } = req.params;

    // ------------------ Get Library ---------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // -------------------------- Get Qr by qrId and studentId -----------------
    const qrCode = await QRCode.findOne({
      _id: qrId,
      studentId: memberId,
      status: "active",
      expiresAt: { $gt: new Date() },
    });

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found." });
    }

    // -------------------------- Generate Fresh QR and sent ----------------
    const imageBuffer = await generateQRBuffer(qrCode.token);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", "inline");

    return res.send(imageBuffer);
  } catch (error) {
    console.error("viewStudentQRImage error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = viewStudentQRImage;
