import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, authUnauthorizedResponse } from '@/lib/auth/verify-auth';

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return authUnauthorizedResponse();
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.userId,
      userLoginName: user.userLoginName,
      userName: user.userName,
      roleId: user.roleId,
      roleName: user.roleName,
    },
  });
}
