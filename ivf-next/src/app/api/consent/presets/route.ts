import { NextResponse } from 'next/server';
import { getPresets } from '@/lib/services-server/consent.service';

export async function GET() {
  return NextResponse.json({ success: true, data: getPresets() });
}
