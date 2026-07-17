const nodemailer = require("nodemailer");

const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `Libro Library <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.log(`Email sending error ${error.message}`);

    console.error("========== SMTP ERROR ==========");
    console.error(error);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Response:", error.response);
    console.error("================================");

    throw error;
    // }
    //     throw new Error(`Email could not be sent, ${error.message}` + error);
  }
};

module.exports = { sendEmail };
