import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashPassword } from '../../../../lib/auth';

const DEFAULT_ADMIN_KEY = 'degen_admin_2026';

function verifyAdmin(request) {
  const secret = process.env.ADMIN_SECRET_KEY || DEFAULT_ADMIN_KEY;
  const headerKey = request.headers.get('x-admin-key');
  const queryKey = request.nextUrl.searchParams.get('key');
  const cookieKey = request.cookies.get('admin_key')?.value;

  const provided = headerKey || queryKey || cookieKey;
  return provided && provided.trim() === secret.trim();
}

export async function POST(request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid Admin Secret Key' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'User ID dan Password Baru wajib diisi.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal harus 6 karakter.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Pemain dengan ID tersebut tidak ditemukan.' }, { status: 404 });
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
      username: user.username,
      message: `Password untuk pemain ${user.username} berhasil di-reset oleh admin!`
    });
  } catch (error) {
    console.error('Error in /api/admin/reset-password:', error);
    return NextResponse.json({ error: 'Gagal mereset password pemain: ' + error.message }, { status: 500 });
  }
}
