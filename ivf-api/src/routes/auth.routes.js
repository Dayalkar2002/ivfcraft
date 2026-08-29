const express = require('express');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const { isDbConfigured, withTimeout } = require('../db/pool');

const router = express.Router();

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

function signToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      userLoginName: user.userLoginName,
      userName: user.userName,
      roleId: user.roleId,
      roleName: user.roleName,
    },
    process.env.JWT_SECRET || 'smart_ivf_jwt_secret_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function toClientUser(user) {
  return {
    id: user.userId,
    userLoginName: user.userLoginName,
    userName: user.userName,
    roleId: user.roleId,
    roleName: user.roleName,
  };
}

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Prefer SQL Server SP login when DB is configured (legacy spUserLogin).
    // Cap wait so unreachable SQL falls through to demo quickly.
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
          return res.json({ success: true, token, user: toClientUser(user) });
        }
      } catch (dbError) {
        console.error('[auth] spUserLogin failed, checking demo fallback:', dbError.message);
      }
    }

    // Demo fallback when DB is offline or ALLOW_DEMO_LOGIN=true
    const allowDemo = process.env.ALLOW_DEMO_LOGIN !== 'false';
    if (allowDemo) {
      const demo = DEMO_USERS.find(
        (u) => u.username === username.trim() && u.password === password.trim()
      );
      if (demo) {
        const token = signToken(demo.user);
        return res.json({
          success: true,
          demo: true,
          token,
          user: toClientUser(demo.user),
        });
      }
    }

    if (!isDbConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          'Database not configured. Set DB_* in ivf-api/.env (from Web.config ConsmArt), or use demo login admin / admin123.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid login ID or password. Please try again.',
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  try {
    const decoded = jwt.verify(
      header.split(' ')[1],
      process.env.JWT_SECRET || 'smart_ivf_jwt_secret_change_in_production'
    );
    return res.json({
      success: true,
      user: {
        id: decoded.userId,
        userLoginName: decoded.userLoginName,
        userName: decoded.userName,
        roleId: decoded.roleId,
        roleName: decoded.roleName,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

module.exports = router;
