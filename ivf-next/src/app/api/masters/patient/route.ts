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
    const { searchParams } = new URL(req.url);
    const satId = Number(searchParams.get('satelliteId')) || 0;
    const data = await masterService.listPatients({ satId });
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.patId ? 'update' : 'insert';
    const data = await masterService.savePatient(body, action);
    return NextResponse.json({ success: true, message: 'Patient saved.', data });
  } catch (error: unknown) {
    const status = (error as Error & { status?: number }).status || 500;
    return NextResponse.json({ success: false, message: (error as Error).message }, { status });
  }
}
