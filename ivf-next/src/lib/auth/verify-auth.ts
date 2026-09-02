import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, UserTokenPayload } from './jwt';

export function getAuthenticatedUser(req: NextRequest): UserTokenPayload | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function authUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { success: false, message: 'Access token is required or invalid.' },
    { status: 401 }
  );
}
