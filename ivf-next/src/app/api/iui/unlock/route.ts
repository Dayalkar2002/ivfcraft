import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';
import { executeDRL } from '@/lib/db/spExecutor';
import { isDbConfigured } from '@/lib/db/pool';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return authUnauthorizedResponse();
    }

    const body = await req.json();

    if (isDbConfigured()) {
      try {
        await executeDRL('spUnlockCycle', [
          { name: '@PatId', value: body.patId || 0 },
          { name: '@CycleId', value: body.cycleId || '' },
          { name: '@ModuleType', value: 'IUI' },
        ]);

        return NextResponse.json({
          success: true,
          message: 'IUI cycle unlocked successfully.',
        });
      } catch (dbErr) {
        console.error('DB error unlocking IUI cycle:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'IUI cycle unlocked successfully (Demo Mode).',
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
