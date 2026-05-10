const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.trim().split(":").map(Number);
  return h * 60 + m;
};

module.exports = timeToMinutes;
