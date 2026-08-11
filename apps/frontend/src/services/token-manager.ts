export interface ITokenManager {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}

/**
 * LocalStorageTokenManager
 * Temporary token manager for development. Can be swapped with HttpOnlyCookieManager later.
 */
export class LocalStorageTokenManager implements ITokenManager {
  private readonly TOKEN_KEY = 'lis_access_token';

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

// Export a singleton instance of the active token manager
export const tokenManager = new LocalStorageTokenManager();
