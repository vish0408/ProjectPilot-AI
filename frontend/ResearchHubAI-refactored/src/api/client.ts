const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = this.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorBody = await response.text();
      let message: string;
      try {
        const parsed = JSON.parse(errorBody);
        message = parsed.error?.detail || parsed.error?.title || parsed.title || errorBody;
      } catch {
        message = errorBody || `Request failed with status ${response.status}`;
      }

      if (response.status === 401 && this.getRefreshToken()) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          return { data: null as unknown as T, success: false, message: "retry" };
        }
        this.clearTokens();
        window.location.reload();
        throw new Error("Session expired. Please login again.");
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return { data: null as unknown as T, success: true };
    }

    const data = await response.json();
    return { data, success: true };
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  private clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  private async autoRetryOnExpiry<T>(fn: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
    const result = await fn();
    if (!result.success && result.message === "retry") {
      return fn();
    }
    return result;
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.autoRetryOnExpiry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    });
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.autoRetryOnExpiry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse<T>(response);
    });
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.autoRetryOnExpiry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse<T>(response);
    });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.autoRetryOnExpiry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    });
  }
}

export const apiClient = new ApiClient();
