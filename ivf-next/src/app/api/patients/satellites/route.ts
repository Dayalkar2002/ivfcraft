import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/pool';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';
import * as patientService from '@/lib/services-server/patient.service';
import { getDemoSatellites } from '@/lib/data/demoClinic';

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return authUnauthorizedResponse();
  }

  const allowDemo = process.env.ALLOW_DEMO_LOGIN !== 'false';

  if (!isDbConfigured()) {
    if (allowDemo) {
      return NextResponse.json({ success: true, demo: true, data: getDemoSatellites() });
    }
    return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
  }

  try {
    const data = await patientService.getSatellites();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    if (allowDemo) {
      console.error('[patients] satellites SP failed, demo fallback:', (error as Error).message);
      return NextResponse.json({ success: true, demo: true, data: getDemoSatellites() });
    }
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
