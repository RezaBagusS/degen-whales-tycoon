import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sendPasswordResetEmail } from '../../../../lib/mailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ error: 'Username atau email wajib diisi' }, { status: 400 });
    }

    const cleanInput = identifier.trim().toLowerCase();

    // Find by username OR email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanInput },
          { email: cleanInput }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Akun dengan username atau email tersebut tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        {
          error: 'Akun ini belum memiliki alamat email yang terdaftar. Silakan hubungi Admin Game melalui Discord/Telegram atau Admin Ops Center untuk reset password Anda.',
          noEmail: true
        },
        { status: 400 }
      );
    }

    // Generate secure 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Clean up any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Save token to DB
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt
      }
    });

    // Send email via Gmail SMTP
    const emailResult = await sendPasswordResetEmail({
      toEmail: user.email,
      username: user.username,
      otpCode
    });

    // Mask email for user privacy display
    const [namePart, domainPart] = user.email.split('@');
    const maskedEmail = namePart.length > 2
      ? `${namePart.slice(0, 2)}***@${domainPart}`
      : `***@${domainPart}`;

    return NextResponse.json({
      success: true,
      message: `Kode verifikasi OTP 6 digit telah dikirim ke ${maskedEmail}`,
      maskedEmail,
      username: user.username,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses permintaan reset password.', details: error.message },
      { status: 500 }
    );
  }
}
