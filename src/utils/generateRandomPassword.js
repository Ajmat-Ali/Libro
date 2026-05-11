const generateRandomPassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "@#$!";
  const all = upper + lower + numbers + symbols;

  let pass = "";
  pass += upper[Math.floor(Math.random() * upper.length)];
  pass += lower[Math.floor(Math.random() * lower.length)];
  pass += numbers[Math.floor(Math.random() * numbers.length)];
  pass += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 4; i < 10; i++) {
    pass += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle so required chars aren't always at start
  return pass
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
};

module.exports = generateRandomPassword;
