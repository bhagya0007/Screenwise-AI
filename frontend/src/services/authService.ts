import { request } from './api';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  organization?: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const authService = {
  switchDemoRole: (role: string): Promise<AuthResponse> => {
    return request<AuthResponse>(`/auth/demo-switch?role=${encodeURIComponent(role)}`, {
      method: 'POST',
    });
  },
  getProfile: (): Promise<AuthUser> => {
    return request<AuthUser>('/auth/me');
  },
};
