const QRCode = require("../../models/qrCode.model");
const generateQRBuffer = require("../../utils/generateQR");

const downloadMyQRImage = async (req, res) => {
  try {
    const { qrId } = req.params;

    // ------------------------ Get active Qr ------------------------
    const qrCode = await QRCode.findOne({
      _id: qrId,
      studentId: req.user._id,
      status: "active",
      expiresAt: { $gt: Date.now() },
    });
    if (!qrCode) {
      return res.status(404).json({
        message: "QR code not found or has expired.",
      });
    }

    // ----------------- Generate fresh QR -------------
    const imageBuffer = await generateQRBuffer(qrCode.token);

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=my-qr-${qrCode._id}.png`,
    );

    return res.send(imageBuffer);
  } catch (error) {
    console.error("downloadMyQRImage error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = downloadMyQRImage;
