import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/pool';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';
import { getCommonMasterByCatId } from '@/lib/services-server/master-registry';
import * as masterService from '@/lib/services-server/master.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ catId: string }> }) {
  const user = getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
  }

  try {
    const { catId: catIdStr } = await params;
    const catId = Number(catIdStr);
    const meta = getCommonMasterByCatId(catId);
    if (!meta) {
      return NextResponse.json({ success: false, message: 'Unknown common master category.' }, { status: 404 });
    }

    const data = await masterService.listCommonMaster(catId);
    return NextResponse.json({ success: true, meta: { ...meta, route: `/masters/common/${catId}` }, data });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ catId: string }> }) {
  const user = getAuthenticatedUser(req);
  if (!user) return authUnauthorizedResponse();
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
  }

  try {
    const { catId: catIdStr } = await params;
    const catId = Number(catIdStr);
    const meta = getCommonMasterByCatId(catId);
    if (!meta) {
      return NextResponse.json({ success: false, message: 'Unknown common master category.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, name, action } = body;
    const data = await masterService.saveCommonMaster(catId, { id, name, action });
    return NextResponse.json({ success: true, message: 'Saved successfully.', data });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
