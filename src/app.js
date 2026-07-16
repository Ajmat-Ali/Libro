const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const ownerRoutes = require("./routes/owner.routes");
const floorSeatRoutes = require("./routes/floorSeat.routes"); // floor and seat routes in same file
const slotPlanRoutes = require("./routes/slotPlan.routes"); // slots and plan routes
const memberRoutes = require("./routes/member.routes");
const ownerBookingRoutes = require("./routes/ownerBooking.routes");
const studentBookingRoutes = require("./routes/studentBooking.routes");
const paymentRoutes = require("./routes/payment.routes");
const studentQrRoutes = require("./routes/studentQR.routes");
const guardQrRoutes = require("./routes/guard.routes");
const ownerQrRoutes = require("./routes/ownerQR.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const studentProfileRoutes = require("./routes/studentProfile.routes");

const { globalLimiter } = require("./middlewares/rateLimiter");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

//  ------------ MIDDLEWARES ------------------------------
app.use(helmet());
app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());

// ----------------- ROUTES-----------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/owner/floors", floorSeatRoutes);
app.use("/api/owner", slotPlanRoutes);
app.use("/api/owner/members", memberRoutes);
app.use("/api/owner/bookings", ownerBookingRoutes);
app.use("/api/student/bookings", studentBookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/student/my-qr", studentQrRoutes);
app.use("/api/guard", guardQrRoutes);
app.use("/api/owner", ownerQrRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/student", studentProfileRoutes);

module.exports = app;
