import { NextResponse } from 'next/server';
import { telemetry } from '../../../../lib/telemetry';

export async function POST(request) {
  try {
    const data = await request.json();
    if (data.type === 'error') {
      telemetry.recordError({
        message: data.message,
        stack: data.stack,
        source: 'client',
        route: data.route || '/',
        user: data.user || null,
        metadata: {
          userAgent: request.headers.get('user-agent'),
          screenSize: data.screenSize,
          timestamp: data.timestamp
        }
      });
    } else if (data.type === 'web-vital') {
      telemetry.recordWebVital(data.metric);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to record telemetry' }, { status: 500 });
  }
}
