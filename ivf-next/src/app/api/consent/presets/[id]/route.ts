import { NextRequest, NextResponse } from 'next/server';
import { resolvePreset } from '@/lib/services-server/consent.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preset = resolvePreset(id);
  if (!preset) {
    return NextResponse.json({ success: false, message: 'Preset not found.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: preset });
}
