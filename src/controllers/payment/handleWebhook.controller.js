const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const razorpayInstance = require("../../config/razorpay");

const handleWebhook = async (req, res) => {
  try {
    // ----------------- STEP 1:- Verify signature -----------------
    // req.body here is raw bytes (Buffer), not a JavaScript object
    // This is because we used express.raw() for this route in app.js
    const receivedSignature = req.headers["x-razorpay-signature"];

    if (!receivedSignature) {
      return res.status(400).json({ message: "No signature found." });
    }
  } catch (error) {}
};

module.exports = handleWebhook;
