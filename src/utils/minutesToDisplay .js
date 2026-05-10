const minutesToDisplay = (totalMinutes) => {
  const minutes = totalMinutes % 1440;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const dispayH = h % 12 === 0 ? 0 : h % 12;
  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
};

module.exports = minutesToDisplay;
