import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import RecoveryForm from "@/components/auth/RecoveryForm";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecuperarPage() {
  return (
    <AuthShell titleKey="auth.forgotTitle">
      <RecoveryForm />
    </AuthShell>
  );
}
