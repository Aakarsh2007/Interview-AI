const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, text) {
    try {
        console.log(`Attempting to send email to ${to} via Resend...`);
        
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', 
            to: to, 
            subject: subject,
            html: `<p>${text}</p>` 
        });

        console.log("Email sent successfully!", data);
        return data;
    } catch (error) {
        console.error("RESEND CRITICAL ERROR:", error);
        throw error; 
    }
}

module.exports = sendEmail;
