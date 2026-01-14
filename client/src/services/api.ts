const API_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

interface AuthStorage {
  state: {
    token?: string;
    refreshToken?: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthData(): AuthStorage['state'] | null {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage) as AuthStorage;
        return state;
      } catch {
        return null;
      }
    }
    return null;
  }

  private setAuthData(token: string, refreshToken: string) {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        parsed.state.token = token;
        parsed.state.refreshToken = refreshToken;
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      } catch {
        // Ignore errors
      }
    }
  }

  private clearAuthData() {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        parsed.state.token = null;
        parsed.state.refreshToken = null;
        parsed.state.isAuthenticated = false;
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      } catch {
        // Ignore errors
      }
    }
  }

  private async refreshTokens(): Promise<boolean> {
    // If already refreshing, wait for that promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const authData = this.getAuthData();
        if (!authData?.refreshToken) {
          return false;
        }

        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: authData.refreshToken }),
        });

        if (!response.ok) {
          this.clearAuthData();
          return false;
        }

        const data = await response.json();
        this.setAuthData(data.accessToken, data.refreshToken);
        return true;
      } catch {
        this.clearAuthData();
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    isRetry = false
  ): Promise<{ data: T; status: number }> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth header unless skipped
    if (!options.skipAuth) {
      const authData = this.getAuthData();
      if (authData?.token) {
        headers['Authorization'] = `Bearer ${authData.token}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    // Handle 401 - try to refresh token
    if (response.status === 401 && !isRetry && !options.skipAuth) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        // Retry the request with new token
        return this.request<T>(endpoint, options, true);
      }
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }

    if (!response.ok) {
      const error = new Error(data.message || 'Request failed') as any;
      error.status = response.status;
      error.response = { data, status: response.status };
      throw error;
    }

    return { data, status: response.status };
  }

  async get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);
