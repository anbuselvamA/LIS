import { tokenManager } from './token-manager';
import { LoginDto, AuthResponse } from '../types/auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class AuthService {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    let res: Response;
    try {
      res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
    } catch (err) {
      throw new Error('Laboratory server is temporarily unavailable.');
    }

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Invalid email or password.');
      }
      if (res.status === 403) {
        throw new Error('Access denied.');
      }
      if (res.status === 404) {
        throw new Error('API route missing.');
      }
      if (res.status >= 500) {
        throw new Error('Server error.');
      }
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Login failed.');
    }

    const data: AuthResponse = await res.json();

    if (data.accessToken) {
      tokenManager.setToken(data.accessToken);
    }

    return data;
  }

  logout(): void {
    tokenManager.removeToken();
  }

  isAuthenticated(): boolean {
    return !!tokenManager.getToken();
  }
}

export const authService = new AuthService();
