import { executeDRL, buildParams } from '@/lib/db/spExecutor';

const LOGIN_SP = 'spUserLogin';
const LOGIN_PARAMS = '@UserLoginName,@UserPassword,@QueryIndex';

export interface UserLoginResult {
  userId: number;
  userLoginName: string;
  userName: string;
  roleId: number;
  roleName: string;
  raw?: Record<string, unknown>;
}

export async function login(username: string, password: string): Promise<UserLoginResult | null> {
  const params = buildParams(LOGIN_PARAMS, [username.trim(), password.trim(), 1]);
  const result = await executeDRL<Record<string, unknown>>(LOGIN_SP, params);
  const rows = result.recordset || [];

  if (!rows.length) {
    return null;
  }

  const row = rows[0];
  return {
    userId: Number(row.UserID ?? row.UserId ?? 0),
    userLoginName: String(row.UserLoginName ?? ''),
    userName: String(row.UserName ?? row.UserLoginName ?? ''),
    roleId: Number(row.UserRitID ?? row.UserRoleId ?? row.RoleId ?? 0),
    roleName: String(row.RoleName ?? row.UserRoleName ?? 'User'),
    raw: row,
  };
}
