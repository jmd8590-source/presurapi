import AuthShell from "@/components/auth/AuthShell";
import RecoveryForm from "@/components/auth/RecoveryForm";

export default function RecuperarPage() {
  return (
    <AuthShell titleKey="auth.forgotTitle">
      <RecoveryForm />
    </AuthShell>
  );
}
