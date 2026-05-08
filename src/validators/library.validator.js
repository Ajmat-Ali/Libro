const validator = require("validator");

const validateName = (name) => {
  if (!name || name.trim() === "") return "Library name is required";
  if (name.trim().length < 3)
    return "Library name must be at least 3 characters";
  if (name.trim().length > 100)
    return "Library name cannot exceed 100 characters";
};

const validateTimeFormat = (time, fieldName) => {
  if (!time || time.trim() === "") return `${fieldName} is required`;
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time.trim()))
    return `${fieldName} must be in HH:MM format (e.g. 06:00)`;
};

const validateAddress = (address = {}) => {
  const errors = {};
  if (!address.street || address.street.trim() === "")
    errors.street = "Street address is required";
  if (!address.city || address.city.trim() === "")
    errors.city = "City is required";
  if (!address.state || address.state.trim() === "")
    errors.state = "State is required";
  if (!address.pincode || address.pincode.trim() === "") {
    errors.pincode = "Pincode is required";
  } else if (!/^[1-9][0-9]{5}$/.test(address.pincode.trim())) {
    errors.pincode = "Please enter a valid 6 digit Indian pincode";
  }
  return errors;
};

const validateContact = (contact = {}) => {
  const errors = {};
  if (!contact.phone || contact.phone.trim() === "") {
    errors.phone = "Contact phone is required";
  } else if (!validator.isMobilePhone(contact.phone.trim(), "en-IN")) {
    errors.phone = "Please enter a valid Indian mobile number";
  }
  if (!contact.email || contact.email.trim() === "") {
    errors.email = "Contact email is required";
  } else if (!validator.isEmail(contact.email.trim())) {
    errors.email = "Please enter a valid email address";
  }
  if (contact.website && !validator.isURL(contact.website.trim())) {
    errors.website = "Please enter a valid website URL";
  }
  return errors;
};

const validateTimings = (timings = {}) => {
  const errors = {};

  const openingError = validateTimeFormat(timings.openingTime, "Opening time");
  if (openingError) errors.openingTime = openingError;
  const closingError = validateTimeFormat(timings.closingTime, "Closing time");
  if (closingError) errors.closingTime = closingError;
  return errors;
};

const validateWorkingDays = (workingDays) => {
  const validDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  if (!workingDays || workingDays.length === 0)
    return "Library must be open on at least 1 day";
  const invalidDays = workingDays.filter((day) => !validDays.includes(day));
  if (invalidDays.length > 0) return `Invalid days: ${invalidDays.join(", ")}`;
};

const validateHourlyRates = (hourlyRates = {}) => {
  const errors = {};
  const validTypes = ["general", "vip", "window", "cabin"];

  const validHourlyRates = Object.keys(hourlyRates);

  validTypes.forEach((type) => {
    if (hourlyRates[type] !== undefined) {
      if (typeof hourlyRates[type] !== "number" || hourlyRates[type] < 0)
        errors[type] = `${type} hourly rate cannot be negative`;
    }
  });

  return errors;
};

const validateHoliday = (data) => {
  const errors = {};

  if (!data.date) errors.date = "Holiday date is required";
  else {
    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
      errors.date = "Please enter a valid date";
    }
  }

  if (!data.reason || data.reason.trim() === "")
    errors.reason = "Holiday reason is required";
  else if (data.reason.trim().length > 100)
    errors.reason = "Reason cannot exceed 100 characters";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ─── Create Library ────────────────────────────────────────────────────────

const validateCreateLibrary = (data) => {
  const errors = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  // timings is required object
  if (!data.timings) {
    errors.timings = "Timings are required";
  } else {
    const timingsErrors = validateTimings(data.timings);
    if (Object.keys(timingsErrors).length > 0) errors.timings = timingsErrors;
  }

  // address is required object
  if (!data.address) {
    errors.address = "Address is required";
  } else {
    const addressErrors = validateAddress(data.address);
    if (Object.keys(addressErrors).length > 0) errors.address = addressErrors;
  }

  // contact is required object
  if (!data.contact) {
    errors.contact = "Contact is required";
  } else {
    const contactErrors = validateContact(data.contact);
    if (Object.keys(contactErrors).length > 0) errors.contact = contactErrors;
  }

  if (data.workingDays) {
    const workingDaysError = validateWorkingDays(data.workingDays);
    if (workingDaysError) errors.workingDays = workingDaysError;
  }

  if (data.hourlyRates) {
    const ratesErrors = validateHourlyRates(data.hourlyRates);
    if (Object.keys(ratesErrors).length > 0) errors.hourlyRates = ratesErrors;
  }

  if (data.description && data.description.trim().length > 500)
    errors.description = "Description cannot exceed 500 characters";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ─── Update Library ────────────────────────────────────────────────────────

const validateUpdateLibrary = (data) => {
  const errors = {};

  if (data.name) {
    const nameError = validateName(data.name);
    if (nameError) errors.name = nameError;
  }

  if (data.timings) {
    const timingsErrors = validateTimings(data.timings);
    if (Object.keys(timingsErrors).length > 0) errors.timings = timingsErrors;
  }

  if (data.address) {
    const addressErrors = validateAddress(data.address);
    if (Object.keys(addressErrors).length > 0) errors.address = addressErrors;
  }

  if (data.contact) {
    const contactErrors = validateContact(data.contact);
    if (Object.keys(contactErrors).length > 0) errors.contact = contactErrors;
  }

  if (data.workingDays) {
    const workingDaysError = validateWorkingDays(data.workingDays);
    if (workingDaysError) errors.workingDays = workingDaysError;
  }

  if (data.hourlyRates) {
    const ratesErrors = validateHourlyRates(data.hourlyRates);
    if (Object.keys(ratesErrors).length > 0) errors.hourlyRates = ratesErrors;
  }

  if (data.description && data.description.trim().length > 500)
    errors.description = "Description cannot exceed 500 characters";

  return { isValid: Object.keys(errors).length === 0, errors };
};

module.exports = {
  validateCreateLibrary,
  validateUpdateLibrary,
  validateHoliday,
};
