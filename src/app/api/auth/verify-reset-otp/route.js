import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashPassword } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, otpCode, newPassword } = body;

    // Validation
    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ error: 'Username atau email wajib diisi' }, { status: 400 });
    }

    if (!otpCode || typeof otpCode !== 'string' || otpCode.trim().length !== 6) {
      return NextResponse.json({ error: 'Kode OTP harus berupa 6 digit angka' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 });
    }

    const cleanInput = identifier.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanInput },
          { email: cleanInput }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 });
    }

    // Verify token
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        code: otpCode.trim(),
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Kode OTP tidak valid atau sudah kadaluarsa (berlaku 15 menit). Silakan minta kode baru.' },
        { status: 400 }
      );
    }

    // Update password hash
    const passwordHash = hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    // Invalidate / delete used token
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Password akun Anda berhasil diperbarui! Silakan masuk dengan password baru.'
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return NextResponse.json(
      { error: 'Gagal mereset password akun.', details: error.message },
      { status: 500 }
    );
  }
}
