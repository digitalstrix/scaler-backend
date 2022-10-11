const nodemailer = require('nodemailer');
const nodemail = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true, // use TLS
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  module.exports = nodemail;