const validateFloorName = (name) => {
  if (!name || name.trim() === "") {
    return "Floor name is required";
  } else if (name.length < 2 || name.length > 50) {
    return "Floor name must be between 2 and 50 characters. e.g:- (Ground Floor, Basement)";
  }
};

const validateFloorNumber = (number) => {
  if (number === undefined || number === null || number === "") {
    return "Floor number is required";
  } else if (!Number.isInteger(Number(number)) || Number(number) < 0) {
    return "Floor number must be a valid non-negative integer (0 = Ground Floor)";
  }
};

const validateDescription = (description) => {
  if (description && description.length > 200) {
    return "Description cannot exceed 200 characters. e.g:- (AC floor, Silent zone)";
  }
};

const validateFloor = (data) => {
  const errors = {};

  const nameError = validateFloorName(data.name);
  if (nameError) errors.name = nameError;

  const numberError = validateFloorNumber(data.number);
  if (numberError) errors.number = numberError;

  const descriptionError = validateDescription(data.description);
  if (descriptionError) errors.description = descriptionError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const validateUpdateFloor = (data) => {
  const errors = {};

  if (data.name !== undefined) {
    if (data.name.trim() === "") {
      errors.name = "Floor name cannot be empty";
    } else if (data.name.trim().length < 2) {
      errors.name = "Floor name must be at least 2 characters";
    } else if (data.name.trim().length > 50) {
      errors.name = "Floor name cannot exceed 50 characters";
    }
  }

  if (data.number !== undefined) {
    if (!Number.isInteger(Number(data.number)) || Number(data.number) < 0) {
      errors.number = "Floor number must be a valid non-negative integer";
    }
  }

  if (data.description !== undefined && data.description !== null) {
    if (data.description.trim().length > 200) {
      errors.description = "Description cannot exceed 200 characters";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

module.exports = {
  validateFloor,
  validateUpdateFloor,
};
