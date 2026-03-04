async function sendPasswordResetEmail(toEmail, userName, resetLink) {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0f;color:#f0f0f5;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#c8f55a;width:48px;height:48px;border-radius:12px;line-height:48px;font-size:24px;">⚡</div>
      </div>
      <h2 style="text-align:center;color:#f0f0f5;margin-bottom:8px;">Reset Your Password</h2>
      <p style="color:#6b6b80;text-align:center;font-size:14px;margin-bottom:24px;">
        Hi ${userName}, we received a request to reset your Pulse account password.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${resetLink}"
           style="display:inline-block;background:#c8f55a;color:#0a0a0f;padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
          Reset Password
        </a>
      </div>
      <p style="color:#6b6b80;text-align:center;font-size:12px;">
        This link expires in 1 hour. If you didn't request this, ignore this email.
      </p>
    </div>
  `;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Pulse Activity Tracker', email: process.env.SMTP_FROM },
      to: [{ email: toEmail }],
      subject: 'Reset your Pulse password',
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API error: ${res.status} - ${err}`);
  }
}

module.exports = { sendPasswordResetEmail };