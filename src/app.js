const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const ownerRoutes = require("./routes/owner.routes");
const floorSeatRoutes = require("./routes/floorSeat.routes"); // floor and seat routes in same file
const slotPlanRoutes = require("./routes/slotPlan.routes"); // slots and plan routes
const memberRoutes = require("./routes/member.routes");
const ownerBookingRoutes = require("./routes/ownerBooking.routes");
const studentBookingRoutes = require("./routes/studentBooking.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();

// ── MIDDLEWARES ──────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g. http://localhost:5001
    credentials: true, // allows cookies to be sent
  }),
);

// ── ROUTES ───────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/owner/floors", floorSeatRoutes);
app.use("/api/owner", slotPlanRoutes);
app.use("/api/owner/members", memberRoutes);
app.use("/api/owner/bookings", ownerBookingRoutes);
app.use("/api/student/bookings", studentBookingRoutes);
app.use("/api/payments", paymentRoutes);

module.exports = app;

// -------------------------------------- ----------------------------------
// const razorpayInstance = require("./config/razorpay");
// console.log(razorpayInstance);
