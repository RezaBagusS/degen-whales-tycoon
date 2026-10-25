// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Authentication & Password Recovery Flows', () => {
  const testUsername = `user_${Date.now()}`;
  const initialPassword = 'password_lama_123';
  const updatedPassword = 'password_baru_456';
  const adminNewPassword = 'admin_override_789';

  test('Registration, change password, admin reset, and forgot password flow', async ({ request }) => {
    // 1. Register test user with email
    const regRes = await request.post('/api/auth/register', {
      data: {
        username: testUsername,
        password: initialPassword,
        email: `${testUsername}@degenwhale.test`
      }
    });
    expect(regRes.status()).toBe(200);
    const regData = await regRes.json();
    expect(regData.success).toBe(true);

    // 2. Change password directly (using cookies from registration)
    const changeFailRes = await request.post('/api/auth/change-password', {
      data: {
        oldPassword: 'wrong_old_password',
        newPassword: updatedPassword
      }
    });
    expect(changeFailRes.status()).toBe(400);

    const changeSuccessRes = await request.post('/api/auth/change-password', {
      data: {
        oldPassword: initialPassword,
        newPassword: updatedPassword
      }
    });
    expect(changeSuccessRes.status()).toBe(200);

    // 3. Verify login works with updated password
    const loginRes = await request.post('/api/auth/login', {
      data: {
        username: testUsername,
        password: updatedPassword
      }
    });
    expect(loginRes.status()).toBe(200);

    // 4. Admin override reset password without old password
    const adminFailRes = await request.post('/api/admin/reset-password', {
      headers: { 'x-admin-key': 'wrong_secret_key' },
      data: {
        userId: regData.user.id,
        newPassword: adminNewPassword
      }
    });
    expect(adminFailRes.status()).toBe(401);

    const adminKey = process.env.ADMIN_SECRET_KEY || 'dw_admin_9x7f2026_whale';
    const adminSuccessRes = await request.post('/api/admin/reset-password', {
      headers: { 'x-admin-key': adminKey },
      data: {
        userId: regData.user.id,
        newPassword: adminNewPassword
      }
    });
    expect(adminSuccessRes.status()).toBe(200);

    // 5. Verify login works with admin reset password
    const loginAfterAdminRes = await request.post('/api/auth/login', {
      data: {
        username: testUsername,
        password: adminNewPassword
      }
    });
    expect(loginAfterAdminRes.status()).toBe(200);

    // 6. Test Forgot Password (OTP generation)
    const forgotRes = await request.post('/api/auth/forgot-password', {
      data: {
        identifier: testUsername
      }
    });
    expect(forgotRes.status()).toBe(200);
    const forgotData = await forgotRes.json();
    expect(forgotData.success).toBe(true);
    expect(forgotData.maskedEmail).toBeDefined();

    // 7. Verify OTP rejection with invalid code
    const invalidOtpRes = await request.post('/api/auth/verify-reset-otp', {
      data: {
        identifier: testUsername,
        otpCode: '000000',
        newPassword: 'otp_password_final_999'
      }
    });
    expect(invalidOtpRes.status()).toBe(400);
  });
});
