import { NextRequest, NextResponse } from 'next/server';
import { executeDRL, buildParams } from '@/lib/db/spExecutor';
import { isDbConfigured } from '@/lib/db/pool';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';

export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return authUnauthorizedResponse();
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: 'Database not configured.' }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { procName, paramNames, values = [] } = body;

    if (!procName || !paramNames) {
      return NextResponse.json(
        { success: false, message: 'procName and paramNames are required.' },
        { status: 400 }
      );
    }

    const params = buildParams(paramNames, values);
    const result = await executeDRL(procName, params);

    return NextResponse.json({
      success: true,
      data: result.recordsets.length === 1 ? result.recordset : result.recordsets,
      rowsAffected: result.rowsAffected,
      returnValue: result.returnValue,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: (error as Error).message || 'Execution failed' },
      { status: 500 }
    );
  }
}
