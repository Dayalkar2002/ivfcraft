import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/pool';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';
import * as masterService from '@/lib/services-server/master.service';

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
  }

  try {
    const data = await masterService.getPatientLookups();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
