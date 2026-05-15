const QRCode = require("../../models/qrCode.model");
const generateQRBuffer = require("../../utils/generateQR");
const viewMyQR = async (req, res) => {
  try {
    const { qrId } = req.params;

    // ---------------------- Get active QRCode ------------------------

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

    // ----------------- Generate fresh QR image from the token and send ---------------
    const imageBuffer = await generateQRBuffer(qrCode.token);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", "inline");

    return res.send(imageBuffer);
  } catch (error) {
    console.error("viewMyQR error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = viewMyQR;
