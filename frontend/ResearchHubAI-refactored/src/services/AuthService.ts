import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { CurrentUser } from "../types/User";

export interface LoginPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  requiresPasswordChange?: boolean;
  fullName?: string;
  email?: string;
  role?: string;
}

export interface BackendCurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  isFirstLogin?: boolean;
  emailVerified?: boolean;
  accountStatus?: string;
  phoneNumber?: string | null;
  employeeId?: string | null;
  collegeId?: string | null;
  collegeName?: string | null;
  departmentName?: string | null;
}

export class AuthService {
  async login(email: string, password: string): Promise<LoginPayload> {
    const response = await apiClient.post<LoginPayload>(ENDPOINTS.auth.login, {
      email,
      password,
    });
    if (!response.success || !response.data) {
      throw new Error(response.message || "Login failed");
    }
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.auth.logout, { refreshToken });
    } catch {
      // Logout is best-effort
    }
  }

  async getCurrentUser(): Promise<CurrentUser> {
    const response = await apiClient.get<BackendCurrentUser>(ENDPOINTS.auth.me);
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to get current user");
    }
    return this.mapToCurrentUser(response.data);
  }

  async changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<void> {
    const response = await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    if (!response.success) {
      throw new Error(response.message || "Failed to change password");
    }
  }

  async activateAccount(token: string, password: string, confirmPassword: string): Promise<void> {
    const response = await apiClient.post(ENDPOINTS.auth.activate, {
      token,
      password,
      confirmPassword,
    });
    if (!response.success) {
      throw new Error(response.message || "Failed to activate account");
    }
  }

  async validateActivationToken(token: string): Promise<{ valid: boolean; expired?: boolean; used?: boolean; fullName?: string; email?: string; userId?: string }> {
    const response = await apiClient.post<{ valid: boolean; expired?: boolean; used?: boolean; fullName?: string; email?: string; userId?: string }>(ENDPOINTS.auth.activateValidate, { token });
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to validate token");
    }
    return response.data;
  }

  async validatePasswordResetToken(token: string): Promise<{ valid: boolean; expired?: boolean; used?: boolean; fullName?: string; email?: string; userId?: string }> {
    const response = await apiClient.post<{ valid: boolean; expired?: boolean; used?: boolean; fullName?: string; email?: string; userId?: string }>(ENDPOINTS.auth.resetPasswordValidate, { token });
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to validate reset token");
    }
    return response.data;
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post(ENDPOINTS.auth.forgotPassword, { email });
    if (!response.success) {
      throw new Error(response.message || "Failed to send reset email");
    }
  }

  async resetPassword(token: string, email: string, newPassword: string, confirmNewPassword: string): Promise<void> {
    const response = await apiClient.post(ENDPOINTS.auth.resetPassword, {
      token,
      email,
      newPassword,
      confirmNewPassword,
    });
    if (!response.success) {
      throw new Error(response.message || "Failed to reset password");
    }
  }

  async resendInvitation(userId: string): Promise<void> {
    const response = await apiClient.post(ENDPOINTS.auth.resendWelcome(userId));
    if (!response.success) {
      throw new Error(response.message || "Failed to resend invitation");
    }
  }

  async resendActivation(token: string): Promise<void> {
    const response = await apiClient.post(ENDPOINTS.auth.activateResend, { token });
    if (!response.success) {
      throw new Error(response.message || "Failed to resend invitation");
    }
  }

  async resendPasswordReset(token: string): Promise<void> {
    const response = await apiClient.post(ENDPOINTS.auth.resetPasswordResend, { token });
    if (!response.success) {
      throw new Error(response.message || "Failed to resend password reset link");
    }
  }

  private mapToCurrentUser(backendUser: BackendCurrentUser): CurrentUser {
    const roleMap: Record<string, CurrentUser["role"]> = {
      superadmin: "superadmin",
      admin: "collegeadmin",
      guide: "guide",
      student: "student",
      hod: "hod",
    };
    const role = roleMap[backendUser.role.toLowerCase()] ?? "collegeadmin";
    return {
      name: backendUser.fullName,
      email: backendUser.email,
      role,
      dept: backendUser.departmentName ?? "",
      institution: backendUser.collegeName ?? "",
      avatar: backendUser.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      isFirstLogin: backendUser.isFirstLogin,
      phoneNumber: backendUser.phoneNumber,
      employeeId: backendUser.employeeId,
      collegeId: backendUser.collegeId,
      collegeName: backendUser.collegeName,
    };
  }

  saveRequiresPasswordChange(flag: boolean): void {
    if (flag) {
      localStorage.setItem("requiresPasswordChange", "true");
    } else {
      localStorage.removeItem("requiresPasswordChange");
    }
  }

  getRequiresPasswordChange(): boolean {
    return localStorage.getItem("requiresPasswordChange") === "true";
  }

  clearRequiresPasswordChange(): void {
    localStorage.removeItem("requiresPasswordChange");
  }

  register(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    role: string
  ): Promise<void> {
    throw new Error("Registration is not available. Users are created by administrators.");
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("requiresPasswordChange");
  }

  getStoredAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  getStoredRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  saveUser(user: CurrentUser): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  getStoredUser(): CurrentUser | null {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
