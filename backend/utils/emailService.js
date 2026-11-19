const axios = require('axios');

const sendEmail = async (options) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
        throw new Error('Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM.');
    }

    try {
        const response = await axios.post(
            'https://api.resend.com/emails',
            {
                from,
                to: [options.email],
                subject: options.subject,
                text: options.message,
                html: `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            }
        );

        console.log('Email sent:', response.data.id);
        return { success: true, message: 'Email sent successfully', messageId: response.data.id };
    } catch (error) {
        const providerMessage = error.response?.data?.message;
        const reason = providerMessage || error.code || error.message;
        console.error('Email sending error:', reason);
        throw new Error(`Failed to send email: ${reason}`);
    }
};

module.exports = sendEmail;
