export interface AuthUser {
  id: number;
  userLoginName: string;
  userName: string;
  roleId: number;
  roleName: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export interface ApiErrorBody {
  success?: boolean;
  message?: string;
}
