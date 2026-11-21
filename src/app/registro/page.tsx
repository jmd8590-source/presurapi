import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Crea tu cuenta" };

export default function RegistroPage() {
  return (
    <AuthShell titleKey="auth.registerTitle">
      <RegisterForm />
    </AuthShell>
  );
}
