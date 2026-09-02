import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured, withTimeout } from '@/lib/db/pool';
import { signToken } from '@/lib/auth/jwt';
import * as authService from '@/lib/services-server/auth.service';

const DEMO_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    user: {
      userId: 1,
      userLoginName: 'admin',
      userName: 'Clinic Admin',
      roleId: 1,
      roleName: 'Admin',
    },
  },
  {
    username: 'doctor',
    password: 'doctor123',
    user: {
      userId: 2,
      userLoginName: 'doctor',
      userName: 'Dr. Fertility',
      roleId: 2,
      roleName: 'Doctor',
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required.' },
        { status: 400 }
      );
    }

    if (isDbConfigured()) {
      try {
        const loginTimeout = Number(process.env.DB_LOGIN_TIMEOUT_MS) || 6000;
        const user = await withTimeout(
          authService.login(username, password),
          loginTimeout,
          'spUserLogin'
        );
        if (user && user.userId) {
          const token = signToken(user);
          return NextResponse.json({
            success: true,
            token,
            user: {
              id: user.userId,
              userLoginName: user.userLoginName,
              userName: user.userName,
              roleId: user.roleId,
              roleName: user.roleName,
            },
          });
        }
      } catch (dbError: unknown) {
        console.error('[auth] spUserLogin failed, checking demo fallback:', (dbError as Error).message);
      }
    }

    const allowDemo = process.env.ALLOW_DEMO_LOGIN !== 'false';
    if (allowDemo) {
      const demo = DEMO_USERS.find(
        (u) => u.username === String(username).trim() && u.password === String(password).trim()
      );
      if (demo) {
        const token = signToken(demo.user);
        return NextResponse.json({
          success: true,
          demo: true,
          token,
          user: {
            id: demo.user.userId,
            userLoginName: demo.user.userLoginName,
            userName: demo.user.userName,
            roleId: demo.user.roleId,
            roleName: demo.user.roleName,
          },
        });
      }
    }

    if (!isDbConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Database not configured. Use demo login admin / admin123.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Invalid login ID or password. Please try again.' },
      { status: 401 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: (error as Error).message || 'Server error' },
      { status: 500 }
    );
  }
}
