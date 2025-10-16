// const nodemailer = require('nodemailer');

// const smtpConfig = {
//     host: 'mail.carscareindia.com',
//     port: 465,
//     secure: true,
//     auth: {
//         user: 'hello@carscareindia.com',
//         pass: 'Intech!23'
//     },
// };

// const transporter = nodemailer.createTransport(smtpConfig);

// // Verify connection configuration
// transporter.verify((error, success) => {
//     if (error) {
//         console.error("❌ SMTP Connection Test Failed!");
//         console.error("Error Details:", error);
//     } else {
//         console.log("✅ SMTP Connection Test Succeeded!");
//         console.log("Server is ready to take our messages. Configuration is correct.");
//     }
// });

// src/test-smtp.js

// 1. Load environment variables from .env file
require('dotenv').config();
const nodemailer = require('nodemailer');

// 2. Access variables from process.env
const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT), // Port should be parsed as an integer
    secure: true, // You confirmed this works with port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
};

const transporter = nodemailer.createTransport(smtpConfig);

// Verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP Connection Test Failed!");
        console.error("Error Details:", error);
    } else {
        console.log("✅ SMTP Connection Test Succeeded!");
        console.log("Server is ready to take our messages. Configuration is correct.");
    }
});