// mailer.js
const nodemailer = require("nodemailer");

// create reusable transporter object
const transporter = nodemailer.createTransport({
  service: "gmail", // or "smtp.ethereal.email" for testing
  auth: {
    user: process.env.MAIL_USER, // your email
    pass: process.env.MAIL_PASS, // your app password (not regular password)
  },
});

// send mail function
async function sendMail(to, subject, text) {
  try {
    const mailOptions = {
      from: `"Meet Scheduler" <${process.env.MAIL_USER}>`,
      to: Array.isArray(to) ? to.join(",") : to, // handles string or array
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Mail sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Mail error:", err);
    throw err;
  }
}

module.exports = sendMail;
