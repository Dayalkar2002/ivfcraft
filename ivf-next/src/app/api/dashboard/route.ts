import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';
import { getDashboardSummary } from '@/lib/services-server/dashboard.service';

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const patId = Number(searchParams.get('patId')) || 0;
  const satId = Number(searchParams.get('satId')) || 0;

  try {
    const summary = await getDashboardSummary({
      patId,
      satId,
      userId: user.userId,
    });
    return NextResponse.json({ success: true, data: summary });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
