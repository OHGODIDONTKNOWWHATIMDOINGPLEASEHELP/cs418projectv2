import Mailjet from 'node-mailjet';

const mjPublic = process.env.MJ_APIKEY_PUBLIC;
const mjPrivate = process.env.MJ_APIKEY_PRIVATE;

let mailjetClient = null;
if (mjPublic && mjPrivate) {
  mailjetClient = Mailjet.apiConnect(mjPublic, mjPrivate);
} else {
  console.warn('Mailjet keys not set – emails will be skipped.');
}

export async function sendMail({ to, subject, html }) {
  if (!mailjetClient) {
    console.error('sendMail: Mailjet client not initialized');
    return;
  }

  const fromEmail = process.env.FROM_EMAIL || 'noreply@example.com';
  const fromName = process.env.FROM_NAME || 'CS418';

  try {
    await mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: fromEmail,
              Name: fromName,
            },
            To: [
              {
                Email: to,
              },
            ],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      });
  } catch (err) {
    // log what Mailjet says
    console.error('sendMail(Mailjet) error:', err?.response?.data || err.message || err);
  }
}
