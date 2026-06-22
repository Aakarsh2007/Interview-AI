import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, text: string): Promise<any> {
    try {
        console.log(`Attempting to send email to ${to} via Resend...`);
        
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', 
            to: to, 
            subject: subject,
            html: `<p>${text}</p>` 
        });

        console.log('Email sent successfully!', data);
        return data;
    } catch (error) {
        console.error('RESEND CRITICAL ERROR:', error);
        throw error; 
    }
}
