import { NextResponse } from 'next/server';
import { getRegistryWithRoutes } from '@/lib/services-server/master-registry';

export async function GET() {
  return NextResponse.json({ success: true, data: getRegistryWithRoutes() });
}
