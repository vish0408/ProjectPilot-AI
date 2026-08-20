import LoginPage from "../pages/auth/LoginPage";
import { useApp } from "../context/AppContext";

export default function AuthLayout() {
  const { login } = useApp();
  return <LoginPage onLogin={login} />;
}
