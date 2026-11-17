import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegistroPage() {
  return (
    <AuthShell titleKey="auth.registerTitle">
      <RegisterForm />
    </AuthShell>
  );
}
