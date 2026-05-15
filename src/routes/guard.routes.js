const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");
const scanQR = require("../controllers/guardQr/scanQR.controller");

router.use(auth, restrictTo("guard"));

router.post("/scan", scanQR);

module.exports = router;
