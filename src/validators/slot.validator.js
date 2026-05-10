const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const validateName = (name) => {
  if (!name || name.trim() === "") {
    return "Slot name is required";
  } else if (name.trim().length < 2) {
    return "Slot name must be at least 2 characters";
  } else if (name.trim().length > 50) {
    return "Slot name cannot exceed 50 characters";
  }
};

const validateStartTime = (startTime) => {
  if (!startTime || startTime.trim() === "") {
    return "Start time is required";
  } else if (!TIME_REGEX.test(startTime.trim())) {
    return "Start time must be in HH:MM format (e.g. 06:00)";
  }
};

const validateEndTime = (endTime) => {
  if (!endTime || endTime.trim() === "") {
    return "End time is required";
  } else if (!TIME_REGEX.test(endTime.trim())) {
    return "End time must be in HH:MM format (e.g. 22:00)";
  }
};

const validateCreateSlot = (data) => {
  const errors = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const startTimeError = validateStartTime(data.startTime);
  if (startTimeError) errors.startTime = startTimeError;

  const endTimeError = validateEndTime(data.endTime);
  if (endTimeError) errors.endTime = endTimeError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const validateUpdateSlot = (data) => {
  const errors = {};

  if (data.name !== undefined) {
    if (data.name.trim() === "") {
      errors.name = "Slot name cannot be empty";
    } else if (data.name.trim().length < 2) {
      errors.name = "Slot name must be at least 2 characters";
    } else if (data.name.trim().length > 50) {
      errors.name = "Slot name cannot exceed 50 characters";
    }
  }

  if (data.startTime !== undefined) {
    if (!TIME_REGEX.test(data.startTime.trim())) {
      errors.startTime = "Start time must be in HH:MM format (e.g. 06:00)";
    }
  }

  if (data.endTime !== undefined) {
    if (!TIME_REGEX.test(data.endTime.trim())) {
      errors.endTime = "End time must be in HH:MM format (e.g. 22:00)";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

module.exports = { validateCreateSlot, validateUpdateSlot };
