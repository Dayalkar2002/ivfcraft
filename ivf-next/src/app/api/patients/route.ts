import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/pool';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';
import * as patientService from '@/lib/services-server/patient.service';
import { getDemoPatients } from '@/lib/data/demoClinic';

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return authUnauthorizedResponse();
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const satelliteId = searchParams.get('satelliteId');

  const allowDemo = process.env.ALLOW_DEMO_LOGIN !== 'false';

  if (!isDbConfigured()) {
    if (allowDemo) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: getDemoPatients(satelliteId ?? undefined, search),
      });
    }
    return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
  }

  try {
    let data: patientService.PatientListItem[] | patientService.PatientDetailItem[] = [];
    if (search) {
      data = await patientService.searchPatients({
        search,
        satelliteId: satelliteId ? Number(satelliteId) : 0,
      });
    } else if (satelliteId) {
      data = await patientService.listPatientsBySatellite(Number(satelliteId));
    }
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    if (allowDemo) {
      console.error('[patients] list/search failed, demo fallback:', (error as Error).message);
      return NextResponse.json({
        success: true,
        demo: true,
        data: getDemoPatients(satelliteId ?? undefined, search),
      });
    }
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
