import jwt, { JwtPayload } from 'jsonwebtoken';

export interface UserTokenPayload {
  userId: number;
  userLoginName: string;
  userName: string;
  roleId: number;
  roleName: string;
}

export function signToken(user: UserTokenPayload): string {
  const secret = process.env.JWT_SECRET || 'smart_ivf_jwt_secret_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

  return jwt.sign(
    {
      userId: user.userId,
      userLoginName: user.userLoginName,
      userName: user.userName,
      roleId: user.roleId,
      roleName: user.roleName,
    },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function verifyToken(token: string): UserTokenPayload {
  const secret = process.env.JWT_SECRET || 'smart_ivf_jwt_secret_change_in_production';
  const decoded = jwt.verify(token, secret) as JwtPayload & UserTokenPayload;
  return {
    userId: decoded.userId,
    userLoginName: decoded.userLoginName,
    userName: decoded.userName,
    roleId: decoded.roleId,
    roleName: decoded.roleName,
  };
}
