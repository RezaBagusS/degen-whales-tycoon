import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
      include: {
        save: true
      }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({
        error: `Akun ini telah disuspend oleh Admin. Alasan: ${user.banReason || 'Pelanggaran aturan game'}`
      }, { status: 403 });
    }

    // Generate session token
    const sessionToken = createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: user.id,
        username: user.username
      },
      save: user.save?.savePayload || user.save
    });

    // Set cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan login. Periksa koneksi database.', details: error.message },
      { status: 500 }
    );
  }
}
