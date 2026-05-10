const VALID_SEAT_TYPES = ["general", "vip", "window", "cabin"];

const validateSeatLabel = (seatLabel) => {
  if (!seatLabel || seatLabel.trim() === "") {
    return "Seat label is required";
  } else if (seatLabel.trim().length > 10) {
    return "Seat label cannot exceed 10 characters";
  } else if (!/^[A-Za-z0-9]+$/.test(seatLabel.trim())) {
    return "Seat label must contain only letters and numbers (e.g. A1, B12)";
  }
};

const validateSeatType = (seatType) => {
  if (!seatType) {
    return "Seat type is required";
  } else if (!VALID_SEAT_TYPES.includes(seatType)) {
    return `Seat type must be one of: ${VALID_SEAT_TYPES.join(", ")}`;
  }
};

const validateCreateSeat = (data) => {
  const errors = {};

  const seatLabelError = validateSeatLabel(data.seatLabel);
  if (seatLabelError) errors.seatLabel = seatLabelError;

  const seatTypeError = validateSeatType(data.seatType);
  if (seatTypeError) errors.seatType = seatTypeError;

  if (data.description && data.description.trim().length > 200) {
    errors.description = "Description cannot exceed 200 characters";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

const validateUpdateSeat = (data) => {
  const errors = {};

  if (data.seatLabel !== undefined || data.seatLabel === "") {
    const seatLabelError = validateSeatLabel(data.seatLabel);
    if (seatLabelError) errors.seatLabel = seatLabelError;
  }

  if (data.seatType !== undefined || data.seatType === "") {
    const seatTypeError = validateSeatType(data.seatType);
    if (seatTypeError) errors.seatType = seatTypeError;
  }

  if (data.description !== undefined && data.description !== null) {
    if (data.description.trim().length > 200) {
      errors.description = "Description cannot exceed 200 characters";
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = { validateCreateSeat, validateUpdateSeat };
