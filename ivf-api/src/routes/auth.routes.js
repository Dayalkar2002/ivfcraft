const express = require('express');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const { isDbConfigured } = require('../db/pool');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    if (!isDbConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Database not configured. Set DB_* variables in ivf-api/.env (same as Web.config ConsmArt).',
      });
    }

    const user = await authService.login(username, password);

    if (!user || !user.userId) {
      return res.status(401).json({ success: false, message: 'Invalid login ID or password. Please try again.' });
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        userLoginName: user.userLoginName,
        userName: user.userName,
        roleId: user.roleId,
        roleName: user.roleName,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
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
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
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
