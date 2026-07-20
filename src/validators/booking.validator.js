const validateCreateOwnerBooking = (data) => {
  const errors = {};

  if (!data.studentId || data.studentId.trim() === "") {
    errors.studentId = "Student is required";
  }

  if (!data.seatId || data.seatId.trim() === "") {
    errors.seatId = "Seat is required";
  }

  if (!data.timeSlotId || data.timeSlotId.trim() === "") {
    errors.timeSlotId = "Time slot is required";
  }

  if (!data.startDate || data.startDate.toString().trim() === "") {
    errors.startDate = "Start date is required";
  } else {
    const date = new Date(data.startDate);
    if (isNaN(date.getTime())) {
      errors.startDate = "Start date must be a valid date";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        errors.startDate = "Start date cannot be in the past";
      }
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

const validateInitiateStudentBooking = (data) => {
  const errors = {};

  if (!data.seatId || data.seatId.toString().trim() === "") {
    errors.seatId = "Seat is required";
  }

  if (!data.timeSlotId || data.timeSlotId.toString().trim() === "") {
    errors.timeSlotId = "Time slot is required";
  }

  if (!data.startDate || data.startDate.toString().trim() === "") {
    errors.startDate = "Start date is required";
  } else {
    const date = new Date(data.startDate);
    if (isNaN(date.getTime())) {
      errors.startDate = "Start date must be a valid date";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        errors.startDate = "Start date cannot be in the past";
      }
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

module.exports = {
  validateCreateOwnerBooking,
  validateInitiateStudentBooking,
};
