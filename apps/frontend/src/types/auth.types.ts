export interface LoginDto {
  email: string;
  password?: string;
}

export type Role = 'ADMIN' | 'RECEPTIONIST' | 'LAB_TECHNICIAN' | 'DOCTOR' | 'REFERRAL_DOCTOR';

export interface AuthUser {
  id: string;       // backend returns 'id'
  email: string;
  role: Role;
  isActive: boolean;
  profileId?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
