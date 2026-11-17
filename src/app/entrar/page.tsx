import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export default function EntrarPage() {
  return (
    <AuthShell titleKey="auth.loginTitle">
      <LoginForm />
    </AuthShell>
  );
}
