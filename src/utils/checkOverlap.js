const Booking = require("../models/booking.model");

const checkOverlap = async (
  seatId,
  timeSlotId,
  startDate,
  endDate,
  excludeBookingId = null,
) => {
  const query = {
    seatId: seatId,
    timeSlotId: timeSlotId,
    status: "active",
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return await Booking.findOne(query);
};

module.exports = checkOverlap;
