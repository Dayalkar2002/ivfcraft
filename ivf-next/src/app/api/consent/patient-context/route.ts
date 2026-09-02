import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/pool';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';
import { getPatientConsentContext } from '@/lib/services-server/consent.service';

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const patId = Number(searchParams.get('patId'));
  const satId = Number(searchParams.get('satId'));

  if (!patId || !satId) {
    return NextResponse.json({ success: false, message: 'patId and satId are required.' }, { status: 400 });
  }

  try {
    const data = await getPatientConsentContext({ patId, satId });
    if (!data) {
      return NextResponse.json({ success: false, message: 'Patient not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
