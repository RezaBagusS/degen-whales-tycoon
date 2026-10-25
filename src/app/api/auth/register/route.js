import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashPassword, createSessionToken, COOKIE_NAME } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, email, localSaveState } = body;

    // Validation
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username wajib diisi' }, { status: 400 });
    }
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3 || cleanUsername.length > 24) {
      return NextResponse.json({ error: 'Panjang username harus antara 3 - 24 karakter' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json({ error: 'Username hanya boleh huruf, angka, dan underscore (_)' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    let cleanEmail = null;
    if (email && typeof email === 'string' && email.trim()) {
      cleanEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
      }
    }

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });
    if (existing) {
      return NextResponse.json({ error: 'Username sudah digunakan, silakan pilih username lain atau login' }, { status: 409 });
    }

    // Hash password & create user
    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        passwordHash,
        email: cleanEmail
      }
    });

    // If local save state provided, migrate into DB immediately
    let initialSave = null;
    if (localSaveState && typeof localSaveState === 'object') {
      try {
        initialSave = await prisma.gameSave.create({
          data: {
            userId: user.id,
            cash: Number(localSaveState.cash || 10),
            peakNetWorth: Number(localSaveState.peakNetWorth || localSaveState.cash || 10),
            whaleTokens: Number(localSaveState.whaleTokens || 0),
            currentLocationLevel: Number(localSaveState.currentLocation?.level || localSaveState.currentLocationLevel || 1),
            upgrades: localSaveState.passiveLevels || localSaveState.upgrades || {},
            inventory: localSaveState.inventory || {},
            activeEffects: localSaveState.activeEffects || {},
            activePosition: localSaveState.activePosition || null,
            tradeHistory: localSaveState.tradeHistory || [],
            savePayload: localSaveState,
            lastSavedAt: new Date()
          }
        });
      } catch (saveErr) {
        console.warn('Could not save initial local save state:', saveErr);
      }
    }

    // Generate Session Token
    const sessionToken = createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      message: 'Akun berhasil dibuat!',
      user: {
        id: user.id,
        username: user.username
      },
      save: initialSave?.savePayload || initialSave
    });

    // Set secure HTTP-only cookie (valid for 30 days)
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Gagal mendaftarkan akun. Periksa koneksi database.', details: error.message },
      { status: 500 }
    );
  }
}
