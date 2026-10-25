import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Sesi telah berakhir. Silakan login kembali.' }, { status: 401 });
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Alamat email wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Format alamat email tidak valid.' }, { status: 400 });
    }

    // Update email in DB
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        email: cleanEmail,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email pemulihan akun berhasil disimpan!',
      email: updatedUser.email
    });
  } catch (error) {
    console.error('Update email error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui email akun.', details: error.message }, { status: 500 });
  }
}
