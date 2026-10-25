import nodemailer from 'nodemailer';

/**
 * Mailer service for sending transactional emails (Password Reset OTP, Alerts)
 * Configured for Gmail SMTP using App Password
 */

export function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || 'rezabagussaputrait@gmail.com';
  const pass = process.env.SMTP_PASS || '';

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    }),
    user,
    hasPass: Boolean(pass && pass.trim())
  };
}

/**
 * Send 6-digit OTP Password Reset Email
 */
export async function sendPasswordResetEmail({ toEmail, username, otpCode }) {
  const { transporter, user, hasPass } = getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #060A14; color: #E2E8F0; margin: 0; padding: 24px; }
        .card { max-width: 480px; margin: 0 auto; background: #0B0E14; border: 1px solid #1E293B; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .logo { font-size: 20px; font-weight: 900; color: #FFFFFF; letter-spacing: 1px; margin-bottom: 24px; }
        .logo span { color: #00FF88; }
        .title { font-size: 18px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }
        .desc { font-size: 13px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: #111622; border: 2px dashed #00FF88; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px; }
        .otp-code { font-family: monospace; font-size: 32px; font-weight: 900; color: #00FF88; letter-spacing: 6px; }
        .expire-note { font-size: 11px; color: #F59E0B; margin-top: 8px; }
        .footer { font-size: 11px; color: #64748B; border-top: 1px solid #1E293B; padding-top: 16px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">DEGEN <span>&amp;</span> WHALE</div>
        <div class="title">🔐 Permintaan Reset Password Akun</div>
        <div class="desc">
          Halo, <strong>${username}</strong>!<br>
          Kami menerima permintaan untuk mereset password akun trading Anda. Masukkan kode verifikasi 6 digit di bawah ini pada halaman reset password:
        </div>
        
        <div class="otp-box">
          <div class="otp-code">${otpCode}</div>
          <div class="expire-note">⏱️ Kode ini hanya berlaku selama 15 menit.</div>
        </div>

        <div class="desc">
          Jika Anda tidak merasa meminta reset password ini, abaikan email ini. Password Anda akan tetap aman dan tidak berubah.
        </div>

        <div class="footer">
          Degen &amp; Whale Syndicate • Cyberpunk Solana Trading Engine<br>
          Dikirim otomatis dari ${user}
        </div>
      </div>
    </body>
    </html>
  `;

  // Jika di local / dev belum diset SMTP_PASS, log kode OTP di terminal agar bisa dites
  if (!hasPass) {
    console.warn(`[MAILER DEV NOTICE] SMTP_PASS belum diset di .env. Kode OTP reset untuk @${username} (${toEmail}): [${otpCode}]`);
    return {
      success: true,
      simulated: true,
      message: 'Kode OTP telah dibuat (Mode Simulasi Dev: periksa log konsol server).'
    };
  }

  const mailOptions = {
    from: `"Degen & Whale Ops" <${user}>`,
    to: toEmail,
    subject: `🔐 [Degen & Whale] Kode Reset Password: ${otpCode}`,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  return {
    success: true,
    messageId: info.messageId
  };
}
