const Library = require("../../models/library.model");
const QRCode = require("../../models/qrCode.model");
const generateQRBuffer = require("../../utils/generateQR");

const downloadStudentQRImage = async (req, res) => {
  try {
    const { qrId, memberId } = req.params;

    // --------------- Get Library ----------------------
    const library = await Library.findOne({ ownerId: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found." });
    }

    // ------------------ Get QRCode ---------------------
    const qrCode = await QRCode.findOne({
      _id: qrId,
      studentId: memberId,
      status: "active",
      expiresAt: { $gt: new Date() },
    });

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found." });
    }

    // ---------------------------- Generate QR and send --------------------
    const imageBuffer = await generateQRBuffer(qrCode.token);
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=student-qr-${req.params.memberId}-${qrCode._id}.png`,
    );

    return res.send(imageBuffer);
  } catch (error) {
    console.error("downloadStudentQRImage error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = downloadStudentQRImage;
