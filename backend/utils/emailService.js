const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        console.log('Attempting to send email...');
        console.log('From:', process.env.MAIL_USER);
        console.log('To:', to);

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: to,
            subject: subject,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return info;
    } catch (error) {
        console.error('CRITICAL ERROR: Failed to send email.');
        console.error('Error details:', error);
        // We generally don't want to throw here to avoid breaking the main request flow
        // unless critical. For notifications, logging is often sufficient.
        return null;
    }
};

module.exports = sendEmail;
