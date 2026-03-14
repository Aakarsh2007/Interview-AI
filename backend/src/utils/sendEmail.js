const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", 
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(to, subject, text) {
    try {
        console.log(`Attempting to send email to ${to}...`);
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log("Email sent successfully: " + info.response);
        return info;
    } catch (error) {
        console.error("NODEMAILER CRITICAL ERROR:", error);
        throw error; 
    }
}

module.exports = sendEmail;

