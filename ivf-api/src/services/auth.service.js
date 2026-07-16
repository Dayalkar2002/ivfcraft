const { executeDRL, buildParams } = require('../db/spExecutor');

const LOGIN_SP = 'spUserLogin';
const LOGIN_PARAMS = '@UserLoginName,@UserPassword,@QueryIndex';

async function login(username, password) {
  const params = buildParams(LOGIN_PARAMS, [username.trim(), password.trim(), 1]);
  const result = await executeDRL(LOGIN_SP, params);
  const rows = result.recordset || [];

  if (!rows.length) {
    return null;
  }

  const row = rows[0];
  return {
    userId: row.UserID ?? row.UserId,
    userLoginName: row.UserLoginName,
    userName: row.UserName ?? row.UserLoginName,
    roleId: row.UserRitID ?? row.UserRoleId ?? row.RoleId,
    roleName: row.RoleName ?? row.UserRoleName ?? 'User',
    raw: row,
  };
}

module.exports = {
  login,
};
