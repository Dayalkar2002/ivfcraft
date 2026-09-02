import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/pool';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';
import { searchConsentPatients } from '@/lib/services-server/consent.service';

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const satelliteId = Number(searchParams.get('satelliteId')) || 0;

  try {
    const data = await searchConsentPatients({ search, satelliteId });
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
