const QRCodeLib = require("qrcode");

// This function takes a UUID token (just a text string)
// and converts it into a QR code IMAGE (buffer = raw image bytes)
//
// Think of it like this:
// Token = "a1b2-c3d4-e5f6"
// QR image = a black and white square picture that stores that text
// When guard scans the QR → phone reads back "a1b2-c3d4-e5f6"
// Backend looks up that token → finds the booking → grants/denies entry
//
// We NEVER save the image anywhere
// We generate it fresh EVERY time student asks to see their QR
// Zero storage cost

const generateQRBuffer = async (token) => {
  const imageBuffer = await QRCodeLib.toBuffer(token, {
    type: "png", // image format
    width: 300, // 300x300 pixels (good size for phone scanning)
    margin: 2, // white border around QR edges
    color: {
      dark: "#000000", // black squares
      light: "#FFFFFF", // white background
    },
  });

  return imageBuffer;
  // imageBuffer is like raw bytes of the image
  // We send this directly to browser → browser shows the image
};

module.exports = generateQRBuffer;
