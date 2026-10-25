import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifySessionToken, verifyPassword, hashPassword, COOKIE_NAME } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Sesi tidak valid atau telah berakhir. Silakan login kembali.' }, { status: 401 });
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Sesi tidak valid. Silakan login kembali.' }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Password lama dan password baru wajib diisi.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal harus 6 karakter.' }, { status: 400 });
    }

    if (oldPassword === newPassword) {
      return NextResponse.json({ error: 'Password baru tidak boleh sama dengan password lama.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Akun pemain tidak ditemukan.' }, { status: 404 });
    }

    const isValid = verifyPassword(oldPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Password lama yang Anda masukkan salah.' }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diperbarui! Silakan gunakan password baru ini untuk login berikutnya.'
    });
  } catch (error) {
    console.error('Error in /api/auth/change-password:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server saat memperbarui password.' }, { status: 500 });
  }
}
