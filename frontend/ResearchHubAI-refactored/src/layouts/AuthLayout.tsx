import { useState, useEffect } from "react";
import LoginPage from "../pages/auth/LoginPage";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import AccountActivationPage from "../pages/auth/AccountActivationPage";
import ActivateAccountPage from "../pages/auth/ActivateAccountPage";
import { useApp } from "../context/AppContext";

export type AuthScreen = "login" | "change-password" | "forgot-password" | "reset-password" | "activate" | "activate-standalone";

export default function AuthLayout() {
  const { login, requiresPasswordChange } = useApp();
  const [authScreen, setAuthScreen] = useState<AuthScreen>(
    requiresPasswordChange ? "change-password" : "login"
  );
  const [resetToken, setResetToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const mode = params.get("mode");

    if (window.location.pathname === "/login") {
      setAuthScreen("login");
      return;
    }

    if (window.location.pathname === "/activate" && token) {
      setAuthScreen("activate-standalone");
      return;
    }

    if (window.location.pathname.startsWith("/reset-password") && token) {
      setResetToken(token);
      setResetEmail(params.get("email") ?? "");
      setAuthScreen("reset-password");
      return;
    }

    if (mode === "activate" && token) {
      setResetToken(token);
      setAuthScreen("activate");
    }
  }, []);

  if (authScreen === "login" && requiresPasswordChange) {
    setAuthScreen("change-password");
  }

  const handleForgotPassword = () => {
    setAuthScreen("forgot-password");
  };

  const handleBackToLogin = () => {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, "", url.toString());
    setAuthScreen("login");
  };

  const handleResetPassword = (token: string, email: string) => {
    setResetToken(token);
    setResetEmail(email);
    setAuthScreen("reset-password");
  };

  const handlePasswordChanged = () => {
    setAuthScreen("login");
  };

  const handleActivationSuccess = () => {
    handleBackToLogin();
  };

  switch (authScreen) {
    case "change-password":
      return <ChangePasswordPage onSuccess={handlePasswordChanged} />;
    case "forgot-password":
      return <ForgotPasswordPage onBackToLogin={handleBackToLogin} onResetLink={handleResetPassword} />;
    case "reset-password":
      return <ResetPasswordPage token={resetToken} email={resetEmail} onSuccess={handleBackToLogin} />;
    case "activate":
      return <AccountActivationPage token={resetToken} onSuccess={handleActivationSuccess} />;
    case "activate-standalone":
      return <ActivateAccountPage />;
    default:
      return <LoginPage onLogin={login} onForgotPassword={handleForgotPassword} />;
  }
}
