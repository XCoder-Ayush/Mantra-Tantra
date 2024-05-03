const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  // Create a transporter with your SMTP settings
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  try {
    const info = await transporter.sendMail({
      from: 'Ayush Sharma <arp23359@gmail.com>',
      to: to,
      subject: subject,
      html: text,
    });

    console.log('Message Sent: %s', info.messageId);
    return info.messageId;
  } catch (error) {
    console.error('Error Sending Email:', error);
    return null;
  }
};

module.exports = sendEmail;
