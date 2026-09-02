import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/pool';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';
import * as patientService from '@/lib/services-server/patient.service';
import { getDemoPatientById } from '@/lib/data/demoClinic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return authUnauthorizedResponse();
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const satelliteId = Number(searchParams.get('satelliteId'));
  const allowDemo = process.env.ALLOW_DEMO_LOGIN !== 'false';

  if (!isDbConfigured()) {
    if (allowDemo) {
      const patient = getDemoPatientById(id, satelliteId);
      if (!patient) {
        return NextResponse.json({ success: false, message: 'Patient not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, demo: true, data: patient });
    }
    return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
  }

  if (!satelliteId) {
    return NextResponse.json({ success: false, message: 'satelliteId query parameter is required.' }, { status: 400 });
  }

  try {
    const patient = await patientService.getPatientById(Number(id), satelliteId);
    if (!patient) {
      return NextResponse.json({ success: false, message: 'Patient not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: patient });
  } catch (error: unknown) {
    if (allowDemo) {
      const patient = getDemoPatientById(id, satelliteId);
      if (patient) {
        return NextResponse.json({ success: true, demo: true, data: patient });
      }
    }
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
