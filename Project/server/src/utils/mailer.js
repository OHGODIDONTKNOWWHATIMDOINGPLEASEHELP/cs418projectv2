import nodemailer from 'nodemailer';

function makeDevTransport() {
  return {
    async sendMail(opts) {
      console.log('[DEV EMAIL]', {
        to: opts.to, subject: opts.subject, html: opts.html, text: opts.text
      });
      return { messageId: 'dev' };
    },
  };
}

let transporter;
if (
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
} else {
  transporter = makeDevTransport(); // logs to console in dev if SMTP not set
}

export async function sendMail({ to, subject, html, text }) {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL || 'CS418 <noreply@example.com>',
    to, subject, html, text,
  });
}
