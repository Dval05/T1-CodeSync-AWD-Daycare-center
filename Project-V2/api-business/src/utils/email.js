import nodemailer from 'nodemailer';

export function createTransportFromEnv() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error('SMTP no configurado. Defina SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
    }
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
}

export async function sendInvoiceEmail({ to, subject, html, attachmentBuffer, filename, from }) {
    const transporter = createTransportFromEnv();
    const { FROM_EMAIL } = process.env;
    const mailFrom = from || FROM_EMAIL || 'no-reply@nicekids.local';

    const info = await transporter.sendMail({
        from: mailFrom,
        to,
        subject,
        html,
        attachments: [
            {
                filename: filename || 'factura.pdf',
                content: attachmentBuffer,
            },
        ],
    });
    return info;
}
