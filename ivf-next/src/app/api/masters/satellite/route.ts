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
    const data = await masterService.listSatellitesMaster();
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
    const action = body.satId ? 'update' : 'insert';
    const data = await masterService.saveSatellite(body, action);
    return NextResponse.json({ success: true, message: 'Satellite saved.', data });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
